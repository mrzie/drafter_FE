import { __basic } from './conf';
import { Subject } from 'rxjs';
import { User } from './types';

const isDesktop = (UA => UA.indexOf("windows nt") >= 0 || UA.indexOf("macintosh") >= 0)(navigator.userAgent.toLowerCase());

export const OAuthLogin = () => openAuthorizePage('OAuthLogin');

export const OAuthExclusiveLogin = () => openAuthorizePage('OAuthExclusiveLogin');

const openAuthorizePage = (path: string) => {
    const
        redirect_uri = encodeURIComponent(`${location.origin}/v1/${path}?redirect_uri=${isDesktop ? '' : location.href}`),
        url = `https://api.weibo.com/oauth2/authorize?client_id=${__basic.sinaClientId}&response_type=code&redirect_uri=${redirect_uri}`;

    if (isDesktop) {
        window.open(url);
    } else {
        location.assign(url);
    }
};

interface OAuthCallbackParam {
    Success: boolean,
    UserInfo: User,
}

Object.defineProperty(window, 'OAuthCallback', {
    get: () => ({ Success, UserInfo }: OAuthCallbackParam) => {
        if (Success) {
            loginResult$.next(UserInfo);
        }
    }
});

export const loginResult$ = new Subject<User>();

