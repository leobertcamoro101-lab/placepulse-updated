import * as Sentry from '@sentry/react'
const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, context?: Record<string, unknown>) => {
    if (isDev) {
      console.error(message, context);
    }
    // in production, send to a real service (Sentry, LogRocket, etc.) here
    Sentry.captureException(new Error(message), { extra: context });
  },
  info: (message: string, context?: Record<string, unknown>) => {
    if (isDev) console.log(message, context);
  },
};