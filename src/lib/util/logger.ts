import winston, {Logger as WinstonLogger} from 'winston';

const {createLogger, format, transports} = winston;
const {
    colorize,
    combine,
    padLevels,
    printf,
    simple,
    timestamp,
} = format;

const logTransports = {
    console: new transports.Console({
        format: combine(
            format(data => ({
                ...data,
                level: data.level.toUpperCase(),
            }))(),
            colorize(),
            timestamp(),
            padLevels(),
            simple(),
            printf(data => {
                const {level, message, timestamp} = data;

                return `[${timestamp}] [${level}] ${message}`;
            })
        ),
    }),
    file: null,
};

let logger: WinstonLogger = createLogger({
    level: 'debug',
    transports: [logTransports.console],
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
    public static info(msg: string, ...messages: string[]): void {
        logger.log('info', msg, ...messages);
    }

    /*
     * Medium priority logging, default.
     */
    public static log(msg: string, ...messages: string[]): void {
        logger.log('info', msg, ...messages);
    }

    public static setFileLogging(uri: string): void {
        logTransports.file = new transports.File({
            filename: uri,
            format: format.timestamp(),
        });

        logger.add(logTransports.file);
    }

    public static setLevel(level: string): void {
        logTransports.console.level = level;

        if (logTransports.file !== null) {
            logTransports.file.level = level;
        }
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
