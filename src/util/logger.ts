import winston from 'winston';

const {ADAMANTIA_LOG_LOCATION} = process.env;

const transports = {
    console: new winston.transports.Console({
        format: winston.format.timestamp(),
    }),
    file: new winston.transports.File({
        filename: `${ADAMANTIA_LOG_LOCATION}/server.log`,
        format: winston.format.timestamp(),
    }),
};

const logger = winston.createLogger({
    level: 'debug',
    transports: [transports.console, transports.file],
});

/**
 * Wrapper around Winston
 */
export class Logger {
    /*
     * Appends red "ERROR" to the start of logs.
     * Highest priority logging.
     */
    public static error(msg: string, ...messages: string[]): void {
        logger.log('error', msg, ...messages);
    }

    /*
     * Medium priority logging, default.
     */
    public static log(msg: string, ...messages: string[]): void {
        logger.log('info', msg, ...messages);
    }

    public static setLevel(level): void {
        transports.console.level = level;
        transports.file.level = level;
    }

    /*
     * Lower priority logging.
     * Only logs if the environment variable is set to VERBOSE.
     */
    public static verbose(msg: string, ...messages: string[]): void {
        logger.log('verbose', msg, ...messages);
    }

    /*
     * Less high priority than error, still higher visibility than default.
     */
    public static warn(msg: string, ...messages: string[]): void {
        logger.log('warn', msg, ...messages);
    }
}

export default Logger;
