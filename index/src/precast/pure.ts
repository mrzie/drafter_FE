import { Blog } from '../model/types';

export const generateAbstract = (b: Blog) => {
    const div = document.createElement('div');

    div.innerHTML = b.content;

    const
        text = div.innerText,
        lines = text.split('\n');

    div.innerText = lines.slice(0, 12).join('\n').slice(0, 300);

    const
        dotTail = lines.length > 12 || text.length > 300 ? '…' : '',
        abstract = div.innerHTML + dotTail;

    return abstract;
};


export const upsertItem: <T>(
    arr: T[],
    matcher: (item: T) => boolean,
    replace: (old?: T) => T
) => T[]
    = (arr, matcher, replace) => {
        const index = arr.findIndex(matcher);
        if (index != -1) {
            arr = [...arr];
            arr[index] = replace(arr[index]);
            return arr
        } else {
            return [...arr, replace(null)];
        }
    };

export const pad0Start = (base: string, len: number) => {
    if (len <= base.length) {
        return base
    }
    const padLen = len - base.length
    return '0'.repeat(padLen) + base
}

/**
 * 
 * @param d 
 * @param pattern some shit like yyyy年mm月dd日 hh:MM:ss
 */
export const timeFormat = (d: Date, pattern: string) => {
    const replacerFactory = (value: any) => (match: string) => pad0Start(value.toString(), match.length)

    return pattern.replace(/y+/g, replacerFactory(d.getFullYear()))
        .replace(/m+/g, replacerFactory(d.getMonth() + 1))
        .replace(/d+/g, replacerFactory(d.getDate()))
        .replace(/h+/g, replacerFactory(d.getHours()))
        .replace(/M+/g, replacerFactory(d.getMinutes()))
        .replace(/s+/g, replacerFactory(d.getSeconds()))
};
