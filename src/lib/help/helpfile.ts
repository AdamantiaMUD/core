export type HelpfileOptions = {
    body: string;
    channel: string;
    command: string;
    keywords?: string[];
    related?: string[];
};

export class Helpfile {
    /* eslint-disable lines-between-class-members */
    public body: string;
    public bundle: string;
    public channel: string;
    public command: string;
    public keywords: string[];
    public name: string;
    public related: string[];
    /* eslint-enable lines-between-class-members */

    public constructor(bundle: string, name: string, options: HelpfileOptions) {
        this.bundle = bundle;
        this.name = name;

        if (!options || !options.body) {
            throw new Error(`Help file [${name}] has no content.`);
        }

        this.keywords = options.keywords || [name];
        this.command = options.command;
        this.channel = options.channel;
        this.related = options.related || [];
        this.body = options.body;
    }
}

export default Helpfile;
