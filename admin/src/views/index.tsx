import { MapStateToProps, connect } from 'react-redux'
import { State } from '../model'
import LoginView from './login'
import { Route, Redirect, Switch, withRouter } from 'react-router-dom'
import * as React from 'react'
import { Drawer } from 'material-ui'
import Navigation from './navigation'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import NoteView from './noteView'
import WasteView from './wasteView'
import Editor from './editor'
import NotebooksView from './notebooks'
import BlogsView from './blogsView'
import BLogView from './blogsView/blogPreview'
import TagsView from './tagsView'
import * as api from '../api'
import { Modals, ModalRange } from './modal'
import PreferenceView from './preferenceView'

const mapStateToProps = (state: State) => ({
    logined: !!state.authenticate,
    // blogComposing: !!(state.interactions.loadings.findIndex(i => i.indexOf('NEWBLOG.') === 0) + 1),
})

const mainStyles: StyleRulesCallback = theme => ({
    drawerDocked: {
        // width: '10%',
        flex: 'none',
    },
    drawerPaper: {
        // width: '10%',
        width: '100%',
        position: 'relative',
        height: '100vh',
        overflowY: 'visible',
        background: '#37474F',
    },
    flexBox: {
        display: 'flex',
    },
    routeLayer: {
        minHeight: '100vh',
        // width: '90%',
        // position: 'fixed',
        // left: '10%',
        overflowX: 'hidden',
        overflowY: 'auto',
        width: '100%',
        position: 'relative',
    },
    logo: {
        height: '50px'
    },
    // progressTop: {
    //     position: 'fixed',
    //     top: 0,
    //     left: 0,
    //     right: 0,
    // },
    // progressTopColor: {
    //     backgroundColor: '#3b8adb',
    // },
    // progressTopBar: {
    //     backgroundColor: '#fff',
    // },
})

class layout extends React.Component<{ classes: any }>{
    componentWillMount() {
        api.getNotebooks()
    }
    render() {
        const { classes } = this.props
        return <div className={classes.flexBox}>

            <Drawer type="permanent" classes={{
                docked: classes.drawerDocked,
                paper: classes.drawerPaper
            }}>
                <div className={classes.logo}> </div>
                <Navigation />
            </Drawer>


            <div className={classes.routeLayer}>
                <Switch>
                    <Route path="/admin/notebook/:nbid" component={NoteView} />
                    <Route path="/admin/notebook/" exact component={NoteView} />
                    {/* <Route path="/admin/unsorted" component={NoteView} /> */}
                    {<Route path="/admin/waste" component={WasteView} />}
                    <Route path="/admin/notebooks" component={NotebooksView} />
                    <Route path="/admin/blogs" component={BlogsView} />
                    <Route path="/admin/blog/:id" component={BLogView} />
                    <Route path="/admin/tags" component={TagsView} />
                    <Route path="/admin/preference" component={PreferenceView} />
                    <Route component={() => <Redirect to="/admin/notebook/" />} />
                </Switch>
            </div>
        </div>
    }
}

const Layout = withStyles(mainStyles)(layout)

const App = (props: { logined: boolean }) => <div>

    {props.logined
        ? <Layout />
        : <LoginView />}
    <Modals />
    <ModalRange id={0} />
</div>


export default withRouter(connect(mapStateToProps)(App))