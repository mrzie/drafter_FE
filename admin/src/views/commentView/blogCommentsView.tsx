
import * as React from 'react'
import { connect, MapStateToProps } from 'react-redux'
import { State, Comment, CommentLoadState, User, CommentState, Blog } from '../../model'
import { BlogCommentItem } from '../comments/commentItem'
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
    id: string,
}


type CommentListProps = CommentReduxProps & CommentOuterProps// & StylesProps

interface CommentViewState {

}

class CommentListView extends React.Component<CommentListProps, CommentViewState> {
    loadResourcesIfNeed(props: CommentListProps) {
        if (props.loadState == undefined) {
            apis.fetchCommentsByBlog(this.props.id)
        }
    }
    _loadComments = () => {
        if (this.props.loadState === CommentLoadState.LOADING) {
            return
        }
        return apis.fetchCommentsByBlog(this.props.id)
    }

    componentWillMount() {
        this.loadResourcesIfNeed(this.props)
    }

    componentWillReceiveProps(next: CommentListProps) {
        this.loadResourcesIfNeed(next)
    }

    render() {
        const { comments, users, blogs, id, loadState } = this.props

        return <div>
            <CommentListStatusBar
                onRefresh={this._loadComments}
                uniq={`blog=${id}`}
                isLoading={loadState === CommentLoadState.LOADING}
            />
            {comments.map(comment => {
                const
                    ref = comment.ref ? comments.find(c => c.id == comment.ref) : null,
                    refUser = ref ? users.find(u => u.id === ref.user) : null
                return <BlogCommentItem
                    comment={comment}
                    key={comment.id}
                    user={users.find(u => u.id === comment.user)}
                    blog={blogs.find(b => b.id === comment.blog)}
                    refComment={ref}
                    refUser={refUser}
                />
            })}
            {comments.length == 0 && <EmptyText />}

        </div>
    }
}

const mapStateToProps: MapStateToProps<CommentReduxProps, CommentOuterProps> = (state: State, ownProps) => {
    const { users, interactions: { commentLoadMarks: loadMarks }, comments, blogs } = state

    return {
        comments: comments.filter(c => c.blog === ownProps.id),
        users,
        loadState: loadMarks[`blog=${ownProps.id}`],
        blogs,
    }
}

export default connect(mapStateToProps)(CommentListView)