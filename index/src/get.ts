interface Params { [name: string]: any }

const stringify = (p: Params) => {
    const arr: [string, any][] = []
    for (var k in p) {
        if (p[k] != undefined) {
            arr.push([k, p[k]])
        }
    }

    return arr
        .sort((a, b) => a[0] > b[0] ? 1 : -1)
        .map(([key, value]) => encodeURI(key) + '=' + encodeURI(value))
        .join('&')
}

const prefixQ = (s: string) => s ? '?' + s : s

export default ((url, p?) => new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('GET', url + prefixQ(p && stringify(p)), true)

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                try {
                    resolve(JSON.parse(this.responseText))
                } catch (e) {
                    reject(e)
                }
            } else {
                // Error :(
                reject(null)
            }
        }
    }

    request.send()
})) as <T>(url: string, params?: Params) => Promise<T>