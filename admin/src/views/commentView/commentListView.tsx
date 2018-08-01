import * as React from 'react'
import { Grid, } from 'material-ui'
import { connect, MapStateToProps } from 'react-redux'
import { State, Comment, CommentLoadState, User, CommentState, Blog, UserLevel } from '../../model'
import CommentItem from '../comments/commentItem'
import { TabName } from './types'
import * as apis from '../../api'
import CommentListStatusBar from '../comments/commentListStatusBar'
import EmptyText from '../comments/emptyText'

interface CommentReduxProps {
    comments: Comment[],
    users: User[],
    loadState: CommentLoadState,
    blogs: Blog[],
}

interface CommentOuterProps {
    type: TabName,
}

type CommentListProps = CommentReduxProps & CommentOuterProps 

class CommentListView extends React.Component<CommentListProps, null> {
    loadResourcesIfNeed(props: CommentListProps) {
        if (props.loadState == undefined) {
            this.loadComments(props.type)
        }
        apis.getBlogsIfNeed()
    }

    loadComments(type: TabName) {
        switch (type) {
            case 'blocked':
                return apis.fetchBlockedComments()
            case 'doubted':
                return apis.fetchDoubtedComments()
            case 'recent':
                return apis.fetchRecentComments()
            case 'removed':
                return apis.fetchRemovedComments()
            case 'reviewing':
                return apis.fetchReviewingComments()
            default:
                console.warn('错误')
        }
    }

    _loadComments = () => {
        if (this.props.loadState === CommentLoadState.LOADING) {
            return
        }
        return this.loadComments(this.props.type)
    }

    componentWillMount() {
        this.loadResourcesIfNeed(this.props)
    }

    componentWillReceiveProps(next: CommentListProps) {
        this.loadResourcesIfNeed(next)
    }

    render() {
        const { comments, users, blogs, type, loadState } = this.props
        return <Grid container justify="center">
            <Grid item md={6}>

                <CommentListStatusBar
                    onRefresh={this._loadComments}
                    uniq={type}
                    isLoading={loadState === CommentLoadState.LOADING}
                />
                {comments.map(comment => <CommentItem
                    comment={comment}
                    key={comment.id}
                    user={users.find(u => u.id === comment.user)}
                    blog={blogs.find(b => b.id === comment.blog)}
                />)}
                {comments.length == 0 && <EmptyText />}
            </Grid>
        </Grid>
    }
}

const mapStateToProps: MapStateToProps<CommentReduxProps, CommentOuterProps > = (state: State, ownProps) => {
    const { users, interactions: { commentLoadMarks: loadMarks }, comments, blogs } = state

    switch (ownProps.type) {
        case 'blocked':
            return {
                comments: comments.filter(c => c.alive && (c.state == CommentState.BLOCK)),
                users,
                loadState: loadMarks.blocked,
                blogs,
            }
        case 'doubted':

            return {
                comments: comments.filter(c => {
                    if (!c.alive) {
                        return false
                    }
                    if (c.state !== CommentState.IMPLICATED) {
                        return false
                    }

                    // 这里要做一下特殊处理
                    // 我们希望这里展示新用户，而不是老用户被牵连的言论
                    const user = users.find(u => u.id === c.user)
                    if (!user) {
                        return false
                    }
                    if (user.level !== UserLevel.DOUBTED) {
                        return false
                    }
                    return true
                }),
                users,
                loadState: loadMarks.doubted,
                blogs,
            }
        case 'recent':
            return {
                comments: comments,
                users,
                loadState: loadMarks.recent,
                blogs,
            }
        case 'removed':
            return {
                comments: comments.filter(c => !c.alive),
                users,
                loadState: loadMarks.removed,
                blogs,
            }
        case 'reviewing':
            return {
                comments: comments.filter(c => c.alive && (c.state == CommentState.REVIEWING)),
                users,
                loadState: loadMarks.reviewing,
                blogs,
            }
    }

    return {
        comments: [],
        users,
        loadState: undefined,
        blogs,
    }
}

export default (connect(mapStateToProps)(CommentListView)) 
