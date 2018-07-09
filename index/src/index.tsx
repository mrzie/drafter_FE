import * as React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import BlogView from './BlogView'
import ListView from './ListView'
import { SvgSymbols } from './svgSymbols'
import { Header, Footer, ErrorView } from './base'
import { Provider } from 'react-redux'
import store from './store'

class Index extends React.Component<null, null> {
    render() {
        return <Provider store={store}>
            <BrowserRouter>
                <div>
                    <SvgSymbols />
                    <Header />
                    <div className="container">
                        <Switch>
                            <Route
                                path="/"
                                exact
                                component={ListView}
                            />
                            <Route
                                path="/tag/:tag"
                                component={ListView}
                            />
                            <Route
                                path="/blog/:id"
                                component={BlogView}
                            />
                            <Route
                                path="/error"
                                component={ErrorView}
                            />
                            <Route
                                component={() => <Redirect to="/error" />}
                            />
                        </Switch>
                    </div>
                    <Footer />
                </div>
            </BrowserRouter>
        </Provider>
    }
}

render(
    <Index />,
    document.getElementById('app')
);