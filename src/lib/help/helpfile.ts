import {hasValue} from '../util/functions.js';

import type HelpfileOptions from './helpfile-options.js';

export class Helpfile {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public body: string;
    public bundle: string;
    public channel: string;
    public command: string;
    public keywords: string[];
    public name: string;
    public related: string[];
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(bundle: string, name: string, options: HelpfileOptions) {
        this.bundle = bundle;
        this.name = name;

        if (!hasValue(options) || options.body.length === 0) {
            throw new Error(`Help file [${name}] has no content.`);
        }

        this.keywords = options.keywords ?? [name];
        this.command = options.command;
        this.channel = options.channel;
        this.related = options.related ?? [];
        this.body = options.body;
    }
}

export default Helpfile;
