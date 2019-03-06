import * as React from 'react';
import { memo } from 'react';
import { __basic } from '../model/conf';
import { useEventHandler, useObservable, useListener } from '../precast/magic';
import { userFromState } from '../model/operators';
import { useStore } from '../model/store';

export const Footer = () => <footer className="footer">
    <div className="container">
        <LogoutEntry />
        Copyright © 2014-2018  Mr.ZiE | All Rights Reserved.<br />
        mrzie@outlook.com&nbsp;{__basic.ICP}
    </div>
</footer>;

const LogoutEntry = () => {
    const { state$, actions } = useStore();
    const user = useObservable(() => userFromState(state$), null);
    const [onClickLogout, logout$] = useEventHandler<React.MouseEvent>();

    // logout
    useListener(() => logout$.subscribe(() => actions.logout()));

    if (!user) {
        return null;
    }
    return <div>{user.name}&nbsp;|&nbsp;<span className="logout-button" onClick={onClickLogout}>退出登录</span></div>;
};

export default memo(Footer);