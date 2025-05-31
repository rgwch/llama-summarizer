/************************************************
 * This file is part of the Documents project
 * Copyright (c) 2024-2025
 * License: MIT
 ************************************************/

export enum LogLevel {
  SILLY = -1,
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  FATAL = 4,
}

export class Logger {
  public logLevel: LogLevel = LogLevel.DEBUG;

  private output(head: string, ...message: String[]): void {
    const date = new Date();
    console.log(`${date.toISOString()} ${head}: ${message.join(' ')}`);
  }

  public silly(...message: String[]): void {
    if (this.logLevel <= LogLevel.SILLY) {
      this.output('SILLY', ...message);

    }
  }
  public debug(...message: String[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.output('DEBUG', ...message);
    }
  }

  public info(...message: string[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      this.output('INFO', ...message);
    }
  }

  public warning(...message: string[]): void {
    if (this.logLevel <= LogLevel.WARNING) {
      this.output('WARNING', ...message);
    }
  }

  public error(...message: string[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      this.output('ERROR', ...message);
    }
  }
  public fatal(...message: string[]): void {
    if (this.logLevel <= LogLevel.FATAL) {
      this.output('FATAL', ...message);
      process.exit(1);
    }
  }


}

export const logger = new Logger();
