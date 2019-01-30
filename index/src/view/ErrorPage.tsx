import * as React from 'react';
import { memo } from 'react';
import { __basic } from '../model/conf';
import { Link } from 'react-router-dom';
import Page from '../precast/page';
import {  useEventHandler } from '../precast/magic';
import {  withLatestFrom } from 'rxjs/operators';

export const ErrorPage = Page(memo(({ history$ }) => {
    const [onBack] = useEventHandler<React.MouseEvent>(
        $ => $.pipe(
            withLatestFrom(history$)
        ).subscribe(([, history]) => history.goBack())
    );

    return <div
        ref={() => document.title = `出错啦！ - ${__basic.sitename}`}
    >
        <h1>出错啦！</h1>
        <p>你要找的东西可能不存在。</p>
        <p><br /></p>
        <p><Link to="/" className="cyan-link">返回首页</Link>或<Link to="javascript:void(0)" onClick={onBack} className="cyan-link">返回上页</Link></p>
    </div>
}));

export default ErrorPage;