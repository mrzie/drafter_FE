import * as React from 'react'
import { History } from 'history'

export default ({ history }: { history: History }) => <div>
    <h1>出错啦！</h1>
    <p>你要找的东西可能不存在。</p>
    <p><br/></p>
    <p><a href="/" className="cyan-link">返回首页</a>或<a href="javascript:void(0)" onClick={() => history.goBack()} className="cyan-link">返回上页</a></p>
</div>