import Helpfile from './helpfile';

export class HelpManager {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public helps: Map<string, Helpfile> = new Map();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public add(help: Helpfile): void {
        this.helps.set(help.name, help);
    }

    public find(search: string): Map<string, Helpfile> {
        const results: Map<string, Helpfile> = new Map();

        for (const [name, help] of this.helps.entries()) {
            if (name.startsWith(search)) {
                results.set(name, help);
            }
            else if (help.keywords.some(keyword => keyword.includes(search))) {
                results.set(name, help);
            }
        }

        return results;
    }

    public get(help: string): Helpfile {
        return this.helps.get(help);
    }

    public getFirst(search: string): Helpfile {
        const results = this.find(search);

        if (!results.size) {
            /**
             * No results found
             */
            return null;
        }

        const [, help] = [...results][0];

        return help;
    }
}

export default HelpManager;
