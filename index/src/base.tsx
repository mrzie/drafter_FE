import { Basic } from './models'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { History } from 'history'

declare let __basic: Basic

export const Header = () => <header className="header">
    <div className="container">
        <Link to="/" className="header-title">{__basic.sitename}</Link>
        <div className="header-intro">{__basic.intro}</div>
    </div>
</header>

export const Footer = () => <footer className="footer">
    <div className="container">
        Copyright © 2014-2018  Mr.ZiE | All Rights Reserved.<br />
        mrzie@outlook.com&nbsp;{__basic.ICP}
    </div>
</footer>

export const ErrorView = ({ history }: { history: History }) => <div
    ref={() => document.title = `出错啦！ - ${__basic.sitename}`}
>
    <h1>出错啦！</h1>
    <p>你要找的东西可能不存在。</p>
    <p><br /></p>
    <p><a href="/" className="cyan-link">返回首页</a>或<a href="javascript:void(0)" onClick={() => history.goBack()} className="cyan-link">返回上页</a></p>
</div>