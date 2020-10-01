import winston from 'winston';

/* eslint-disable-next-line import/no-namespace */
import type * as Transport from 'winston-transport';
import type {Logger as WinstonLogger} from 'winston';
import type {TransformableInfo} from 'logform';

import {hasValue} from './functions';

const {createLogger, format, transports} = winston;
const {
    colorize,
    combine,
    padLevels,
    printf,
    simple,
    timestamp,
} = format;

interface LogMessage extends TransformableInfo {
    timestamp: string;
}

const logTransports: {[key: string]: Transport | null} = {
    console: new transports.Console({
        format: combine(
            format((data: TransformableInfo) => ({
                ...data,
                level: data.level.toUpperCase(),
            }))(),
            colorize(),
            timestamp(),
            padLevels(),
            simple(),
            printf((data: LogMessage) => {
                const {level, message, timestamp: lineTs} = data;

                return `[${lineTs}] [${level}] ${message}`;
            })
        ),
    }),
    file: null,
};

const logger: WinstonLogger = createLogger({
    level: 'debug',
    transports: [logTransports.console as Transport],
});

/**
 * Wrapper around Winston
 */
export const Logger = {
    /*
     * Appends red "ERROR" to the start of logs.
     * Highest priority logging.
     */
    error: (msg: string, ...messages: string[]): void => {
        logger.log('error', msg, ...messages);
    },

    /*
     * Medium priority logging, default.
     */
    info: (msg: string, ...messages: string[]): void => {
        logger.log('info', msg, ...messages);
    },

    /*
     * Medium priority logging, default.
     */
    log: (msg: string, ...messages: string[]): void => {
        logger.log('info', msg, ...messages);
    },

    setFileLogging: (uri: string): void => {
        logTransports.file = new transports.File({
            filename: uri,
            format: format.timestamp(),
        });

        logger.add(logTransports.file);
    },

    setLevel: (level: string): void => {
        logTransports.console!.level = level;

        if (hasValue(logTransports.file)) {
            logTransports.file!.level = level;
        }
    },

    /*
     * Lower priority logging.
     * Only logs if the environment variable is set to VERBOSE.
     */
    verbose: (msg: string, ...messages: string[]): void => {
        logger.log('verbose', msg, ...messages);
    },

    /*
     * Less high priority than error, still higher visibility than default.
     */
    warn: (msg: string, ...messages: string[]): void => {
        logger.log('warn', msg, ...messages);
    },
};

export default Logger;
