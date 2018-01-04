import { Note, TempNote, Blog } from '../model'
import { parse as _marked } from 'marked'

// export const flat: (pms: Promise<any>) => Promise<any[2]> = pms => pms.then(res => [res, null], err => [null, err]);

// export const Flat: (target: any) => (...args:any[]) => Promise<[any, any]> = target => (...args) => flat(target(args));

// typescript not support es2017, fuck you

const pad0Start = (base: string, len: number) => {
    if (len <= base.length) {
        return base
    }
    const padLen = len - base.length
    return '0'.repeat(padLen) + base
}

export const timeFormat = (d: Date, pattern: string) => {
    const replacerFactory = (value: any) => (match: string) => pad0Start(value.toString(), match.length)

    return pattern.replace(/y+/g, replacerFactory(d.getFullYear()))
        .replace(/m+/g, replacerFactory(d.getMonth() + 1))
        .replace(/d+/g, replacerFactory(d.getDate()))
        .replace(/h+/g, replacerFactory(d.getHours()))
        .replace(/M+/g, replacerFactory(d.getMinutes()))
        .replace(/s+/g, replacerFactory(d.getSeconds()))
}

export const tempIdPrefix = (str: string) => 'TEMP_' + str

export const isTempIdPrefixed = (str: string) => str.indexOf('TEMP_') === 0

export const sort: { [name: string]: (a: Note | TempNote | Blog, b: Note | TempNote | Blog) => number } = {
    createASC: (a, b) => a.createAt - b.createAt,
    createDESC: (a, b) => b.createAt - a.createAt,
    editASC: (a, b) => a.editAt - b.editAt,
    editDESC: (a, b) => b.editAt - a.editAt,
}

export const marked = (str: string) => _marked(str, { breaks: true })

export const handle = <T>(pms: Promise<T>) => pms.then(
    data => [data, null],
    err => [null, err]
) as Promise<[T, any]>

export const isBlogBusy = (id: string, loadings: string[]) => {
    // let prefix

    // for (prefix of ['ACTIVATEBLOG.', 'EDITBLOG.', 'DELETEBLOG.']) {
    //     if (loadings.indexOf(prefix + id) > -1) {
    //         return true
    //     }
    // }
    // return false
    return !!['ACTIVATEBLOG.', 'EDITBLOG.', 'DELETEBLOG.'].find(s => loadings.indexOf(s + id) > -1)
}