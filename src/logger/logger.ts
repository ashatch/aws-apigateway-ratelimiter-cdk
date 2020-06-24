import { config, createLogger, format, transports } from "winston";

export enum LogLevel {
  INFO = "info",
  WARN = "warning",
  ERROR = "error",
  DEBUG = "debug",
}

export interface LoggingData {
}

class LoggerImpl {
  public readonly logger = createLogger({
    levels: config.syslog.levels,
    level: LogLevel.INFO,
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
    exceptionHandlers: [new transports.Console()],
  });

  private readonly appData: LoggingData = { context: {} };

  public error(message: string, errorData?: object): void {
    this.log(LogLevel.ERROR, message, errorData);
  }

  public warn(message: string, additionalData?: Partial<LoggingData>): void {
    this.log(LogLevel.WARN, message, additionalData);
  }

  public info(message: string, additionalData?: Partial<LoggingData>): void {
    this.log(LogLevel.INFO, message, additionalData);
  }

  public debug(message: string, additionalData?: Partial<LoggingData>): void {
    this.log(LogLevel.DEBUG, message, additionalData);
  }

  private log(level: string, message: string, additionalData?: object): void {
    if (additionalData) {
      this.logger.log(level, message, { ...this.appData, ...additionalData });
    } else {
      this.logger.log(level, message, this.appData);
    }
  }
}

export const Logger = new LoggerImpl();