import * as React from 'react'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
import Tabs, { Tab } from 'material-ui/Tabs'
import { match as Match } from 'react-router'
import { History } from 'history'
import CommentListView from './commentListView'
import { TabName, TabNames } from './types'
import userCommentView from './userCommentView';
export const UserCommentView = userCommentView // todo

interface CommentPageProps {
    match: Match<{ type: TabName }>,
    history: History,
}

interface StylesProps {
    classes: any,
}

type CommentViewProps = CommentPageProps & StylesProps

class CommentView extends React.Component<CommentViewProps, null> {

    tabClickHandler: { [key in TabName]?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> } = {}

    constructor(...args: any[]) {
        super(...args)

        let key: TabName
        for (key of TabNames) {
            let k = key
            this.tabClickHandler[k] = e => {
                if (this.props.match.params.type == k) {
                    return
                }
                this.props.history.push('/admin/comments/' + k)
            }
        }
    }

    componentWillMount() {
        if (!this.isValidPage(this.props.match.params.type)) {
            return
        }
    }

    componentWillReceiveProps(nextProps: CommentViewProps) {
        if (!this.isValidPage(nextProps.match.params.type)) {
            return
        }
    }

    isValidPage(type: TabName) {
        if (TabNames.indexOf(type) > -1) {
            return true
        } else {
            this.props.history.replace('/admin/comments/recent')
            return false
        }
    }

    render() {
        const { classes } = this.props
        return <div className={classes.container}>
            <AppBar color="default">
                <Tabs
                    value={this.props.match.params.type}
                    onChange={() => null}
                    indicatorColor="#3b8adb"
                    centered
                >
                    <Tab value="recent" label="最新" onClick={this.tabClickHandler.recent} />
                    <Tab value="reviewing" label="待审核" onClick={this.tabClickHandler.reviewing} />
                    <Tab value="doubted" label="未置信" onClick={this.tabClickHandler.doubted} />
                    <Tab value="blocked" label="已屏蔽" onClick={this.tabClickHandler.blocked} />
                    <Tab value="removed" label="已删除" onClick={this.tabClickHandler.removed} />
                </Tabs>
            </AppBar>
            <div className={classes.main}>
                <CommentListView type={this.props.match.params.type}/>
            </div>
        </div>
    }
}

const styles: StyleRulesCallback = theme => ({
    container: {
        overflow: 'hidden',
        height: '100%',
    },
    tabsIndecator: {
        backgroundColor: '#1890ff',
    },
    main: {
        paddingTop: '70px',
        overflowX: 'hidden',
        overflowY: 'auto',
        boxSizing: 'border-box',
        height: '100vh',
    },
})

export default withStyles(styles)(CommentView)