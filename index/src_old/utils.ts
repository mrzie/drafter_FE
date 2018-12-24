export const decodeQuery = (str: string) => str
    .split('&')
    .reduce((query, s) => {
        const [key, value] = s.split('=')
        query[decodeURIComponent(key)] = decodeURIComponent(value)
        return query
    }, {} as { [key: string]: string })

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
}
