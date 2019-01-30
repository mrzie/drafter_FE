import * as React from 'react';
import { memo, useContext, useEffect } from 'react';
import { __basic } from '../model/conf';
import { Context } from '../model/store';
import { useEventHandler, useObservable } from '../precast/magic';
import { User } from '../model/types';
import { userFromState } from '../precast/operators';

export const Footer = memo(() => <footer className="footer">
    <div className="container">
        <LogoutEntry />
        Copyright © 2014-2018  Mr.ZiE | All Rights Reserved.<br />
        mrzie@outlook.com&nbsp;{__basic.ICP}
    </div>
</footer>);

const LogoutEntryController = () => {
    const { state$, actions } = useContext(Context);
    const user = useObservable(() => state$.pipe(userFromState()), null);
    const [onClickLogout] = useEventHandler<React.MouseEvent>(
        $ => $.subscribe(() => {
            actions.logout();
        })
    );

    return [user, onClickLogout] as [User, typeof onClickLogout];
};

const LogoutEntry = () => {
    const [user, onClickLogout] = LogoutEntryController();
    if (!user) {
        return null;
    }
    return <div>{user.name}&nbsp;|&nbsp;<span className="logout-button" onClick={onClickLogout}>退出登录</span></div>;
};

export default Footer;