export interface Env {
  // Bindings
  DB: D1Database;
  INSTALLERS: R2Bucket;

  // Vars
  ENVIRONMENT: string;
  APP_URL: string;
  INSTALLER_URL_TTL_SECONDS: string;
  JWT_TTL_SECONDS: string;
  TRIAL_DAYS: string;
  ISSUER: string;

  // Secrets
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_SOLO: string;
  // Pricing v2 solo variants: founder lifetime rate and annual prepay.
  STRIPE_PRICE_SOLO_FOUNDER: string;
  STRIPE_PRICE_SOLO_ANNUAL: string;
  STRIPE_PRICE_PRACTICE: string;
  STRIPE_PRICE_PRACTICE_EXTRA_SEAT: string;
  // Practice block licensing: flat monthly blocks of up to 10/15/20 seats.
  STRIPE_PRICE_PRACTICE_10: string;
  STRIPE_PRICE_PRACTICE_15: string;
  STRIPE_PRICE_PRACTICE_20: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  LICENSE_SIGNING_KEY_PRIVATE: string;
  LICENSE_SIGNING_KEY_PUBLIC: string;
  DOWNLOAD_SIGNING_SECRET: string;
}

export type Tier = 'trial' | 'solo' | 'practice' | 'enterprise';
export type PaidTier = 'solo' | 'practice' | 'enterprise';
export type SubStatus = 'active' | 'past_due' | 'canceled' | 'expired';

export interface Subscription {
  id: string;
  stripe_session_id: string | null;
  customer_id: string | null;
  customer_email: string;
  tier: Tier;
  seat_limit: number;
  status: SubStatus;
  current_period_end: number | null;
  trial_ends_at: number | null;
  converted_to_sub_id: string | null;
  email_sent_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface Seat {
  id: string;
  subscription_id: string;
  seat_token: string;
  assigned_email: string | null;
  device_fingerprint: string | null;
  device_label: string | null;
  bound_at: number | null;
  last_seen_at: number | null;
  created_at: number;
}

export interface LicenseClaims {
  sub: string;          // seat id
  sub_id: string;       // subscription id
  tier: Tier;
  fp: string;           // device fingerprint
  period_end: number;   // current_period_end for paid, trial_ends_at for trial
  is_trial: boolean;
  iat?: number;
  exp?: number;
  iss?: string;
}
