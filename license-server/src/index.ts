import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import checkout from './routes/checkout';
import webhooks from './routes/webhooks';
import fulfill from './routes/fulfill';
import trial from './routes/trial';
import activate from './routes/activate';
import refresh from './routes/refresh';
import portal from './routes/portal';
import validate from './routes/validate';
import events from './routes/events';
import founder from './routes/founder';
import templates from './routes/templates';
import unsubscribe from './routes/unsubscribe';
import webinar from './routes/webinar';
import { runNurture } from './lib/nurture';

const app = new Hono<{ Bindings: Env }>();

// CORS: allow the marketing site and the desktop app to hit the API.
// The desktop app sends no Origin header, so it is unaffected.
app.use('/api/*', cors({
  origin: (origin, c) => {
    const allow = new Set([c.env.APP_URL, 'https://boreasworkflow.com', 'https://www.boreasworkflow.com', 'https://boreasclinical.com', 'https://www.boreasclinical.com']);
    // Reflect the Origin only when it is allow-listed. For any other origin,
    // return '' so no Access-Control-Allow-Origin header is emitted (rather than
    // reflecting an unrelated allowed origin). The desktop app sends no Origin
    // and is unaffected.
    return origin && allow.has(origin) ? origin : '';
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature'],
}));

app.get('/', (c) => c.text('boreasclinical-license'));
app.get('/health', (c) => c.json({ ok: true, env: c.env.ENVIRONMENT }));

app.route('/api/checkout', checkout);
app.route('/api/fulfill', fulfill);
app.route('/api/webhooks/stripe', webhooks);
app.route('/api/trial/start', trial);
app.route('/api/license/activate', activate);
app.route('/api/license/refresh', refresh);
app.route('/api/portal', portal);
app.route('/api/events', events);
app.route('/api/founder', founder);
app.route('/api/templates', templates);
app.route('/api/email/unsubscribe', unsubscribe);
app.route('/api/webinar', webinar);
// Desktop app license validation (contract in app's src/main/setup/license.ts).
app.route('/v1/licenses/validate', validate);


app.onError((err, c) => {
  console.error('unhandled', err);
  return c.json({ error: 'internal_error' }, 500);
});

app.notFound((c) => c.json({ error: 'not_found' }, 404));

export default {
  fetch: app.fetch,
  // Daily trial nurture (cron in wrangler.toml). See src/lib/nurture.ts.
  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runNurture(env));
  },
};
