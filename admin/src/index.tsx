import { render } from 'react-dom'
import * as React from 'react'
import * as api from './api/index'
import { Provider } from 'react-redux'
import { store } from './store'
import Views from './views'
import { BrowserRouter } from 'react-router-dom'

render(
    <Provider store={store}>
        <BrowserRouter>
            <Views />
        </BrowserRouter>
    </Provider>,
    document.getElementById('app')
);