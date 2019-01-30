import * as React from 'react';
import { render } from 'react-dom';
import Context from './model/store';
import { SvgSymbolsDefinitions } from './svgSymbols';
import RouterView from './router';
import { __conf } from './model/conf';
import { State, Comment } from './model/types';
import defineActions from './model/defineActions';
import { Store } from './model/store';
import { useDebouncedState } from './precast/magic';

const AppController = () => {
    const [state$, mutation$] = useDebouncedState({
        tags: __conf.tags,
        lists: __conf.lists,
        blogs: __conf.blogs,
        loadStack: [],
        users: __conf.user ? [__conf.user] : [],
        user: __conf.user,
        comments: new Map<string, Comment[]>(),
    } as State);

    const context: Store = {
        state$,
        actions: defineActions(state$, mutation$),
    };
    return context;
};

export const App = () => {
    const context = AppController();

    return <Context.Provider value={context}>
        <div>
            <SvgSymbolsDefinitions />
            <RouterView />
        </div>
    </Context.Provider>
};

render(
    <App />,
    document.getElementById('app')
);