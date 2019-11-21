import each from 'jest-each';

import {humanize} from '~/lib/util/time';

describe('time.ts', () => {
    describe('humanize()', () => {
        const testCases: Array<[number, string]> = [
            [10050, '10 seconds'],
            [100050, '1 minute, 40 seconds'],
            [1000050, '16 minutes, 40 seconds'],
            [10000050, '2 hours, 46 minutes, 40 seconds'],
        ];

        each(testCases).it(
            'should format the timestamp correctly',
            (ts: number, output: string) => {
                expect.assertions(1);

                expect(humanize(ts)).toStrictEqual(output);
            }
        );
    });
});
