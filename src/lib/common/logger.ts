/* eslint-disable import/no-namespace */
import type { TransformableInfo } from 'logform';
import winston, { type Logger as WinstonLogger } from 'winston';
import type * as Transport from 'winston-transport';

/* eslint-enable import/no-namespace */

import { cast, hasValue } from '../util/functions.js';

import type LogMessage from './log-message.js';

const { createLogger, format, transports } = winston;
const { colorize, combine, padLevels, printf, simple, timestamp } = format;

const logTransports: Record<string, Transport | null> = {
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
            printf((data: TransformableInfo) => {
                /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                const {
                    level,
                    message,
                    timestamp: lineTs,
                } = data as LogMessage;
                /* eslint-enable @typescript-eslint/no-unsafe-assignment */

                return `[${lineTs}] [${level}] ${message as string}`;
            })
        ),
    }),
    file: null,
};

const logger: WinstonLogger = createLogger({
    level: 'debug',
    transports: [logTransports.console!],
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
            logTransports.file.level = level;
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

/*
 * Small utility to eliminate typing these couple lines a bajillion places
 */
export const logAndRethrow = (err: unknown): void => {
    Logger.error(cast<Error>(err).message);

    throw new Error(cast<Error>(err).message);
};

export default Logger;
