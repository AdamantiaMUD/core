import winston, {Logger} from 'winston';

const transports = {
    console: new winston.transports.Console({
        format: winston.format.timestamp(),
    }),
    file: null,
};

let logger: Logger = winston.createLogger({
    level: 'debug',
    transports: [transports.console],
});

/**
 * Wrapper around Winston
 */
export class AppLogger {
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

    public static setFileLogging(uri: string): void {
        transports.file = new winston.transports.File({
            filename: uri,
            format: winston.format.timestamp(),
        });

        logger.add(transports.file);
    }

    public static setLevel(level: string): void {
        transports.console.level = level;

        if (transports.file !== null) {
            transports.file.level = level;
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

export default AppLogger;
