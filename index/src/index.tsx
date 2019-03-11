import * as React from 'react';
import { Comment } from './model/types';
import Store, { useStore } from './model/store';
import { __conf } from './model/conf';
import { SvgSymbolsDefinitions } from './svgSymbols';
import RouterView from './router';
import { useListener } from 'fugo';
import { loginResult$ } from './model/oauth';
import { render } from 'react-dom';

const App = () => {
    return <Store.Provider
        initValue={{
            tags: __conf.tags,
            lists: __conf.lists,
            blogs: __conf.blogs,
            loadStack: [],
            users: __conf.user ? [__conf.user] : [],
            user: __conf.user,
            comments: new Map<string, Comment[]>(),
        }}
    >
        <Main />
    </Store.Provider>
};

const Main = () => {
    const { actions } = useStore();
    useListener(() => loginResult$.subscribe(user => actions.login(user)));

    return <div>
        <SvgSymbolsDefinitions />
        <RouterView />
    </div>;
};

render(
    <App />,
    document.getElementById('app')
);