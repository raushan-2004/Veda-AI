import { env } from '@/config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class VisualLogger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const stamps = {
      info: '✨ \x1b[32m[INFO]\x1b[0m',  // Green
      warn: '⚠️ \x1b[33m[WARN]\x1b[0m',  // Yellow
      error: '❌ \x1b[31m[ERROR]\x1b[0m', // Red
      debug: '🔍 \x1b[36m[DEBUG]\x1b[0m', // Cyan
    };

    return `[\x1b[90m${timestamp}\x1b[0m] ${stamps[level]} ${message}`;
  }

  public info(message: string, ...meta: any[]): void {
    console.info(this.formatMessage('info', message), ...meta);
  }

  public warn(message: string, ...meta: any[]): void {
    console.warn(this.formatMessage('warn', message), ...meta);
  }

  public error(message: string, ...meta: any[]): void {
    console.error(this.formatMessage('error', message), ...meta);
  }

  public debug(message: string, ...meta: any[]): void {
    if (env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message), ...meta);
    }
  }
}

export const logger = new VisualLogger();
export default logger;
