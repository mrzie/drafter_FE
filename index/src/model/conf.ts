import { State, Basic } from './types'
import { generateAbstract } from '../precast/pure'

declare let __conf: State
declare let __basic: Basic

let _conf = __conf, _basic = __basic;

if (_conf) {
    const now = +new Date()
    _conf.lists && _conf.lists.forEach(l => l.syncAt = now)
    _conf.blogs && _conf.blogs.forEach(b => {
        b.abstract = generateAbstract(b)
    })
}

if (!_basic) {
    _basic = {
        sitename: `mrzie's blog`,
        domain: 'domain',
        intro: 'welcome to my website',
        author: '',
        ICP: '',
        sinaClientId: '',
    }
}

export {
    _conf as __conf,
    _basic as __basic,
}