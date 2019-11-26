import Config from './config';

const DEFAULT_MAX_LENGTH = 16;
const DEFAULT_MIN_LENGTH = 4;

const checkEasyStuff = (config: Config, name: string): void => {
    const maxLength = config.get('maxAccountNameLength', DEFAULT_MAX_LENGTH);
    const minLength = config.get('minAccountNameLength', DEFAULT_MIN_LENGTH);

    if (!name) {
        throw new Error('Please enter a name.');
    }

    if (name.length > maxLength) {
        throw new Error('Too long, try a shorter name.');
    }

    if (name.length < minLength) {
        throw new Error('Too short, try a longer name.');
    }
};

export const validateAccountName = (config: Config, name: string): void => {
    checkEasyStuff(config, name);

    if (!(/^[a-z]+$/iu).test(name)) {
        throw new Error('Your name may only contain A-Z without spaces or special characters.');
    }
};

export const validateCharacterName = (config: Config, name: string): void => {
    checkEasyStuff(config, name);

    if (!(/^[a-z]+$/iu).test(name)) {
        throw new Error('Your name may only contain A-Z without spaces or special characters.');
    }

    /*
     * @TODO: Is this feasible? Needs thought before implementing
     * if (!(/^\p{L}+$/iu).test(name)) {
     *     throw new Error('Your name may only contain Latin characters without spaces or special characters.');
     * }
     */
};
