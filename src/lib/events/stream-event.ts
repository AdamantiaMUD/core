export class StreamEvent<T> {
    public NAME: string = '';
    public payload: T;

    constructor(props?: T) {
        if (typeof props === 'undefined') {
            return;
        }

        this.payload = props;

        return new Proxy(this, {
            get: (obj: StreamEvent<T>, prop: 'NAME' | 'getName' | 'payload' | keyof T) => {
                switch (prop) {
                    case 'NAME':
                        return obj.NAME;

                    case 'getName':
                        return obj.getName;

                    case 'payload':
                        return obj.payload;

                    default:
                        return obj.payload[prop];
                }
            },
        });
    }

    public getName(): string {
        return this.NAME;
    }
}

export default StreamEvent;
