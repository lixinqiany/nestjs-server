import { Global, Module, Logger } from "@nestjs/common";
import { WinstonModule, utilities as nestWinstonModuleUtilities } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";
import { join } from "node:path";
import {
  isDev,
  LOG_LEVEL,
  MAX_SIZE_PER_LOG_FILE,
  LOG_DATE_PATTERN,
  MAX_LOG_FILES,
} from "#/constant";

const getLogLevel = (): string => {
  return LOG_LEVEL || (isDev ? "debug" : "info");
};

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.ms(),
      ),
      transports: [
        new winston.transports.Console({
          // log level in winston is error>warn>info(equivalent to log in nestjs)>http>verbose>debug>silly
          level: getLogLevel(),
          // stderrLevels: ["error"] assigns the error level log to the console's stderr stream
          // e.g. yarn start:prod 2> err.log （2 means the stderr）only records errors in err.log
          // forceConsole: true replaces the default `process.stdout.write` with `console.log`

          format: winston.format.combine(
            // first parm is the our software name
            nestWinstonModuleUtilities.format.nestLike("nestjs-server", {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
        // 统一日志文件：按文件大小和日期切割，不再单独区分 error log
        new winston.transports.DailyRotateFile({
          dirname: join(process.cwd(), "logs"),
          filename: "nestjs-server_%DATE%.log",
          // A string representing the moment.js date format to be used for rotating.
          // Frequency is determined by the finest time unit in this pattern (e.g., "HH" for hourly).
          datePattern: LOG_DATE_PATTERN,
          // whether or not to gzip archived log files
          zippedArchive: true,
          // Maximum size of the file after which it will rotate
          maxSize: MAX_SIZE_PER_LOG_FILE,
          // Maximum number of logs to keep. By default, no logs will be removed. If using days, add 'd' as the suffix.
          maxFiles: MAX_LOG_FILES,
          level: getLogLevel(),
          format: winston.format.combine(
            nestWinstonModuleUtilities.format.nestLike("nestjs-server", {
              colors: false,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
      ],
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
