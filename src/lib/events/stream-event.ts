export class StreamEvent<T> {
    public NAME: string = '';

    public payload: T | undefined;

    public constructor(props?: T) {
        this.payload = props;

        /* eslint-disable-next-line no-constructor-return */
        return new Proxy(this, {
            get: (obj: StreamEvent<T>, prop: 'NAME' | 'payload' | keyof T): string | T | unknown => {
                switch (prop) {
                    case 'NAME':
                        return obj.NAME;

                    case 'payload':
                        return obj.payload;

                    default:
                        return obj.payload?.[prop];
                }
            },
        });
    }

    public static getName(): string {
        const inst = new this();

        return inst.NAME;
    }
}

export default StreamEvent;
