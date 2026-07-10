#!/usr/bin/env node

import { mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const DEFAULT_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL ?? 'whisper-1';
const DEFAULT_CONCURRENCY = clampInt(process.env.TRANSCRIBE_CONCURRENCY ?? '2', 1, 8);
const DEFAULT_OUTPUT_FORMAT = process.env.TRANSCRIPT_FORMAT ?? 'txt';
const MAX_BYTES = 24 * 1024 * 1024;
const MEDIA_EXTENSIONS = new Set(['.mp3', '.mp4', '.m4a', '.wav', '.webm', '.mov', '.mkv', '.aac', '.flac', '.ogg']);

const args = parseArgs(process.argv.slice(2));
if (args.help || args.inputs.length === 0) {
  printHelp();
  process.exit(args.inputs.length === 0 ? 1 : 0);
}

const openaiKey = process.env.OPENAI_API_KEY;

const ffmpegPath = process.env.FFMPEG_PATH ?? 'ffmpeg';
const whisperPath = process.env.WHISPER_PATH ?? 'whisper';
const outDir = path.resolve(args.outDir ?? 'transcripts');
await ensureDir(outDir);

const mediaFiles = await expandInputs(args.inputs);
if (mediaFiles.length === 0) {
  console.error('No media files found.');
  process.exit(1);
}

const jobs = mediaFiles.map((input) => ({
  input,
  base: normalizeBaseName(path.basename(input, path.extname(input))),
}));

let index = 0;
const results = [];
const workers = Array.from({ length: Math.min(DEFAULT_CONCURRENCY, jobs.length) }, async () => {
  while (index < jobs.length) {
    const currentIndex = index++;
    const job = jobs[currentIndex];
    const result = await transcribeOne(job, {
      openaiKey,
      ffmpegPath,
      whisperPath,
      outDir,
      sequence: currentIndex + 1,
      model: args.model ?? DEFAULT_MODEL,
      outputFormat: args.format ?? DEFAULT_OUTPUT_FORMAT,
    });
    results.push(result);
    if (result.ok) {
      console.log(`[ok] ${path.basename(job.input)} -> ${result.outputPath}`);
    } else {
      console.error(`[error] ${path.basename(job.input)} -> ${result.outputPath}`);
      console.error(`  ${result.error}`);
    }
  }
});

await Promise.all(workers);

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error(`Finished with ${failed.length} failure(s).`);
  process.exit(1);
}

console.log(`Done. ${results.length} transcript(s) written to ${outDir}.`);

async function transcribeOne(job, opts) {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'boreas-transcribe-'));
  const prefix = existingReelPrefix(job.base) ?? `reel-${String(opts.sequence).padStart(2, '0')}-${job.base}`;
  const transcriptBase = path.join(opts.outDir, prefix);
  const outputPath = `${transcriptBase}.${opts.outputFormat === 'json' ? 'json' : 'txt'}`;

  try {
    const hasAudio = await hasAudioStream(job.input, opts.ffmpegPath);
    if (!hasAudio) {
      await writeNoAudioTranscript(outputPath, job.input, opts.outputFormat);
      return { ok: true, status: 'ok', outputPath };
    }

    if (opts.openaiKey) {
      const media = await prepareMedia(job.input, scratch, opts.ffmpegPath);
      const fileBytes = await readFile(media.path);
      if (fileBytes.byteLength > MAX_BYTES) {
        return { ok: false, status: 'error', outputPath, error: `media too large for upload (${fileBytes.byteLength} bytes)` };
      }
      const transcript = await transcribeAudio(fileBytes, path.basename(media.path), opts.openaiKey, opts.model);
      if (opts.outputFormat === 'json') {
        await writeFile(outputPath, JSON.stringify(transcript, null, 2));
      } else {
        await writeTranscriptTxt(outputPath, transcript);
      }
    } else {
      await transcribeWithWhisper(job.input, outputPath, opts.whisperPath, opts.outputFormat);
    }
    return { ok: true, status: 'ok', outputPath };
  } catch (error) {
    return { ok: false, status: 'error', outputPath, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

async function transcribeWithWhisper(inputPath, outputPath, whisperPath, outputFormat) {
  const dir = path.dirname(outputPath);
  const args = [inputPath, '--model', 'base', '--output_dir', dir, '--output_format', outputFormat === 'json' ? 'json' : 'txt', '--verbose', 'False'];
  await run(whisperPath, args);
  const generated = path.join(dir, `${path.basename(inputPath, path.extname(inputPath))}.${outputFormat === 'json' ? 'json' : 'txt'}`);
  if (generated !== outputPath) {
    await import('node:fs/promises').then(({ rename }) => rename(generated, outputPath));
  }
}

async function prepareMedia(inputPath, scratchDir, ffmpegPath) {
  const hasAudio = await hasAudioStream(inputPath, ffmpegPath);
  if (!hasAudio) {
    return { path: inputPath, direct: true };
  }

  const outputPath = path.join(scratchDir, `${path.basename(inputPath, path.extname(inputPath))}.m4a`);
  await run(ffmpegPath, [
    '-y',
    '-i', inputPath,
    '-vn',
    '-ac', '1',
    '-ar', '16000',
    '-b:a', '64k',
    '-map_metadata', '-1',
    '-fflags', '+bitexact',
    outputPath,
  ]);
  return { path: outputPath, direct: false };
}

async function hasAudioStream(inputPath, ffmpegPath) {
  const probePath = ffmpegPath.replace(/ffmpeg$/, 'ffprobe');
  const out = await runCapture(probePath, [
    '-v', 'error',
    '-select_streams', 'a',
    '-show_entries', 'stream=index',
    '-of', 'csv=p=0',
    inputPath,
  ]);
  return out.trim().length > 0;
}

async function transcribeAudio(audioBytes, filename, apiKey, model) {
  const form = new FormData();
  form.append('model', model);
  form.append('file', new Blob([audioBytes]), filename);
  form.append('response_format', preferredResponseFormat(model));
  form.append('temperature', '0');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`transcription failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

async function writeTranscriptTxt(outputPath, transcript) {
  const lines = [];
  if (typeof transcript.text === 'string' && transcript.text.trim()) {
    lines.push(transcript.text.trim());
  }
  if (Array.isArray(transcript.segments) && transcript.segments.length > 0) {
    lines.push('', 'Segments');
    for (const segment of transcript.segments) {
      const start = formatTime(segment.start);
      const end = formatTime(segment.end);
      lines.push(`[${start} - ${end}] ${String(segment.text ?? '').trim()}`);
    }
  }
  await writeFile(outputPath, lines.join('\n') + '\n');
}

async function writeNoAudioTranscript(outputPath, inputPath, outputFormat) {
  const note = `No audio track detected in ${path.basename(inputPath)}.`;
  if (outputFormat === 'json') {
    await writeFile(outputPath, JSON.stringify({ text: '', note, source: path.basename(inputPath) }, null, 2) + '\n');
    return;
  }
  await writeFile(outputPath, `${note}\n`);
}

async function expandInputs(inputs) {
  const files = [];
  for (const input of inputs) {
    const abs = path.resolve(input);
    const fileStat = await safeStat(abs);
    if (fileStat?.isFile()) {
      files.push(abs);
      continue;
    }
    if (fileStat?.isDirectory()) {
      const entries = await readdir(abs, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (MEDIA_EXTENSIONS.has(ext)) files.push(path.join(abs, entry.name));
      }
      continue;
    }
    throw new Error(`input not found: ${input}`);
  }
  return files.sort();
}

async function safeStat(filePath) {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${command} exited ${code}: ${stderr.trim()}`));
    });
  });
}

function runCapture(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve(stdout);
      reject(new Error(`${command} exited ${code}: ${stderr.trim()}`));
    });
  });
}

async function ensureDir(dir) {
  await import('node:fs/promises').then(({ mkdir }) => mkdir(dir, { recursive: true }));
}

function parseArgs(argv) {
  const out = { inputs: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') out.help = true;
    else if (arg === '-o' || arg === '--out') out.outDir = argv[++i];
    else if (arg === '-m' || arg === '--model') out.model = argv[++i];
    else if (arg === '-f' || arg === '--format') out.format = argv[++i];
    else if (arg.startsWith('-')) throw new Error(`unknown flag: ${arg}`);
    else out.inputs.push(arg);
  }
  return out;
}

function formatTime(seconds) {
  if (!Number.isFinite(Number(seconds))) return '00:00:00.000';
  const totalMs = Math.max(0, Math.round(Number(seconds) * 1000));
  const h = Math.floor(totalMs / 3600000);
  const m = Math.floor((totalMs % 3600000) / 60000);
  const s = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':') + `.${String(ms).padStart(3, '0')}`;
}

function clampInt(value, min, max) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function preferredResponseFormat(model) {
  return model.includes('whisper') ? 'verbose_json' : 'json';
}

function printHelp() {
  console.log(`Usage: node scripts/transcribe-media.mjs [options] <file-or-dir>...

Options:
  -o, --out <dir>     Output directory for transcripts (default: ./transcripts)
  -m, --model <name>  Transcription model (default: ${DEFAULT_MODEL})
  -f, --format <fmt>  txt or json (default: ${DEFAULT_OUTPUT_FORMAT})
  -h, --help          Show this help

Environment:
  OPENAI_API_KEY           Required
  OPENAI_TRANSCRIBE_MODEL   Override default transcription model
  TRANSCRIBE_CONCURRENCY    Parallel jobs, default 2
  FFMPEG_PATH              Override ffmpeg binary path
`);
}

function normalizeBaseName(name) {
  return name.replace(/^reel-\d+-/, '');
}

function existingReelPrefix(name) {
  return /^reel-\d+-\d+$/.test(name) ? name : null;
}
