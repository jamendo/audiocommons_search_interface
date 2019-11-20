import { translate } from "./translate";

/**
 * Compiles a list of words, chained by commas and a translation of the word "and".
 * @example
 *     list('one', 'two'); // one and two
 *     list('one', 'two', 'three'); // one, two and three
 */
export function list(...words: string[]) {
    words = words.filter(word => typeof word === 'string')
                .map(word => word.trim())
                .filter(word => word.length > 0);

    if (words.length === 0) {
        return '';
    }

    if (words.length === 1) {
        return words[0];
    }

    const [lastWord] = words.splice(-1, 1);
    return `${words.join(', ')} ${translate('generic.and')} ${lastWord}`;
}
