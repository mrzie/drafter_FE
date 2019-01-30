import * as React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import ErrorPage from './view/ErrorPage';
import ListPage from './view/ListPage';

import Header from './view/Header';
import Footer from './view/Footer';
import BlogPage from './view/BlogPage';
export const RouterView = () => <BrowserRouter>
    <div>
        <Header />
        <div className="container">
            <Switch>
                <Route
                    path="/"
                    exact
                    component={ListPage}
                />
                <Route
                    path="/tag/:tag"
                    component={ListPage}
                />
                <Route
                    path="/blog/:id"
                    component={BlogPage}
                />
                <Route
                    path="/error"
                    component={ErrorPage}
                />
                <Route
                    component={() => <Redirect to="/error" />}
                />
            </Switch>
        </div>
        <Footer />
    </div>
</BrowserRouter>

export default RouterView;