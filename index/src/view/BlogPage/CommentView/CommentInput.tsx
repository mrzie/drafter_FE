import * as React from 'react';
import { memo } from 'react';
import { useObservable } from 'fugo';
import { useStore } from '../../../model/store';
import { userFromState } from '../../../model/operators';
import { Sina } from '../../../svgSymbols';
import { OAuthLogin, OAuthExclusiveLogin } from '../../../model/oauth';
import { map } from 'rxjs/operators';
import CommentInputBox from './CommentInputBox';

const CommentInput = () => {
    const { state$ } = useStore();
    const hasLogin = useObservable(() => state$.pipe(userFromState, map(u => !!u)), false);

    return hasLogin
        ? <CommentInputBox />
        : <CommentLoginButton />
};

const CommentLoginButton = () => {
    return <div className="flex-row-container">
        <div
            className="login-button"
            onClick={OAuthLogin}
        >
            <Sina /> 登陆后发表评论
        </div>
        <div
            className="exclusive-login-button"
            onClick={OAuthExclusiveLogin}
        >
            强势登陆
        </div>
    </div>
};

export default memo(CommentInput);