import Config from './config';

describe('config.ts', () => {
    it('`load()` should populate the data correctly', () => {
        expect.assertions(2);

        const cfg = new Config();

        expect(cfg.get('foo')).toBeNull();

        cfg.load({foo: 'bar'});

        expect(cfg.get('foo')).toStrictEqual('bar');
    });

    it('`set()` should update a value correctly', () => {
        expect.assertions(2);

        const cfg = new Config();
        cfg.load({foo: 'bar'});

        expect(cfg.get('foo')).toStrictEqual('bar');

        cfg.set('foo', 'baz');

        expect(cfg.get('foo')).toStrictEqual('baz');
    });
});
