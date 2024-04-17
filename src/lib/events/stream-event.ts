export class StreamEvent<T> {
    public NAME: string = '';

    public payload: T | undefined;

    public constructor(props?: T) {
        this.payload = props;

        /* eslint-disable-next-line no-constructor-return */
        return new Proxy(this, {
            get: (
                obj: StreamEvent<T>,
                prop: string
            ): T | T[keyof T] | string | undefined => {
                switch (prop) {
                    case 'NAME':
                        return obj.NAME;

                    case 'payload':
                        return obj.payload;

                    default:
                        return obj.payload?.[prop as keyof T];
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
