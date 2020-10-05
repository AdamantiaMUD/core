export interface StreamEventConstructor<T> {
    new (props?: T);
    getName?: () => string;
}

export default StreamEventConstructor;
