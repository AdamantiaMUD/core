import type Broadcastable from './broadcastable.js';

export type MessageFormatter = (target: Broadcastable, message: string) => string;

export default MessageFormatter;
