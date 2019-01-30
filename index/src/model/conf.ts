import { State, Basic} from './types'
import { generateAbstract } from '../precast/pure'

declare let __conf: State
declare let __basic: Basic


if (__conf) {
    const now = +new Date()
    __conf.lists && __conf.lists.forEach(l => l.syncAt = now)
    __conf.blogs && __conf.blogs.forEach(b => {
        b.abstract = generateAbstract(b)
    })
}

if (!__basic) {
    __basic = {
        sitename: `mrzie's blog`,
        domain: 'domain',
        intro: 'welcome to my website',
        author: '',
        ICP: '',
        sinaClientId: '',
    }
}

export {
    __conf,
    __basic,
}