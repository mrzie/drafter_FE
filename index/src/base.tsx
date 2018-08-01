import { Basic, State, User } from './models'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { History } from 'history'
import { connect, MapStateToProps } from 'react-redux'
import * as api from './apis'

declare let __basic: Basic

export const Header = () => <header className="header">
    <div className="container">
        <Link to="/" className="header-title">{__basic.sitename}</Link>
        <div className="header-intro">{__basic.intro}</div>
    </div>
</header>

export const Footer = () => <footer className="footer">
    <div className="container">
        <LogoutEntry />
        Copyright © 2014-2018  Mr.ZiE | All Rights Reserved.<br />
        mrzie@outlook.com&nbsp;{__basic.ICP}
    </div>
</footer>

const mapStateToProps: MapStateToProps<LogoutEntryProps, null, State> = state => {
    return {
        user: state.user,
    }
}

interface LogoutEntryProps {
    user: User,
}
const LogoutEntry = connect(mapStateToProps)(({ user }: LogoutEntryProps) => {
    if (!user) {
        return <div></div>
    }
    return <div>{user.name}&nbsp;|&nbsp;<span className="logout-button" onClick={api.Logout}>退出登录</span></div>
})


export const ErrorView = ({ history }: { history: History }) => <div
    ref={() => document.title = `出错啦！ - ${__basic.sitename}`}
>
    <h1>出错啦！</h1>
    <p>你要找的东西可能不存在。</p>
    <p><br /></p>
    <p><Link to="/" className="cyan-link">返回首页</Link>或<Link to="javascript:void(0)" onClick={() => history.goBack()} className="cyan-link">返回上页</Link></p>
</div>