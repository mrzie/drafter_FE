import * as React from 'react'
import { History } from 'history'
import { Link } from 'react-router-dom'
export default ({ history }: { history: History }) => <div>
    <h1>出错啦！</h1>
    <p>你要找的东西可能不存在。</p>
    <p><br /></p>
    <p><Link to="/" className="cyan-link">返回首页</Link>或<Link to="javascript:void(0)" onClick={() => history.goBack()} className="cyan-link">返回上页</Link></p>
</div>