import * as React from 'react'
import * as api from '../../api'
import { Comment, User, Blog, CommentState, UserLevel } from '../../model'
import { Card, Button } from 'material-ui'
import { CardContent } from 'material-ui/Card'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { timeFormat } from '../../utils'
import { Link } from 'react-router-dom'

interface CommentItemProps {
    comment: Comment,
    user: User,
    blog: Blog,
}

const styles: StyleRulesCallback = () => ({
    root: {
        marginBottom: '15px',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        '&:hover $buttons': {
            opacity: 1,
        },
        fontWeight: 300,
    },
    avatar: {
        margin: '10px',
        width: '60px',
        height: '60px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '50%',
        backgroundColor: '#eee',
    },
    avatarSmall: {
        width: '40px',
        height: '40px',
    },
    main: {
        padding: '15px 15px 6px',
        width: '100%',
    },
    blogCommentMain: {
        flex: 1,
    },
    time: {
        color: '#ccc',
        fontSize: '.9em',
    },
    commentContent: {
        margin: '10px 0',
    },
    commentFooter: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    buttons: {
        opacity: .1,
        transition: 'opacity .25s ease-out',
    },
    button: {
        minWidth: 'auto',
    },
    commentTitle: {
        color: '#000',
        fontSize: '1.1em',
        textDecoration: 'none',
        transition: 'color .2s ease-out',
        fontWeight: 500,
        '&:hover': {
            color: '#3b8adb',
        },
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        flex: 'none',
        flexDirection: 'column',
        color: '#000',
        textDecoration: 'none',
    },
    userName: {
        fontSize: '.8em',
        textAlign: 'center',
    },
    refComment: {
        padding: '5px',
        background: '#ddd',
        fontSize: '.7em',
        borderRadius: '3px',
    },
})

interface StatusIconProps {
    state: CommentState,
    alive: boolean,
}

const statusIconStyle: StyleRulesCallback = () => ({
    root: {
        display: 'inline-block',
        marginRight: '10px',
        padding: '2px 3px',
        color: '#fff',
        fontSize: '.7em',
        fontWeight: 300,
        backgroundColor: '#666',
        borderRadius: '2px',
    },
    reviewing: {
        backgroundColor: '#e74c3c',
    },
    nagative: {
        backgroundColor: '#95a5a6',
    },
})


const statusIcon = ({ classes, state, alive }: { classes: { [name: string]: string } } & StatusIconProps) => {
    if (state == CommentState.PASS && alive) {
        return null
    }

    let
        text = '已删除',
        style = classes.nagative

    if (alive) {
        switch (state) {
            case CommentState.REVIEWING:
                text = '待审核'
                style = classes.reviewing
                break
            case CommentState.IMPLICATED:
                text = '用户受限'
                style = classes.reviewing
                break
            case CommentState.BLOCK:
                text = '已屏蔽'
                style = classes.nagative
                break
        }
    }
    return <div className={`${classes.root} ${style}`}>{text}</div>
}

const StatusIcon = withStyles(statusIconStyle)(statusIcon) as React.ComponentClass<StatusIconProps>

class CommentItem<T extends { classes?: void } = { classes?: void }> extends React.Component<CommentItemProps & T & { classes: { [name: string]: string } }> {
    renderUserInfo() {
        const { user, classes } = this.props

        return <Link className={classes.userInfo} to={`/admin/user/${user.id}`}>
            <Avatar
                src={user.avatar}
                classes={{ root: classes.avatar }}
            />
            <div className={classes.userName} >{user.name}</div>
        </Link>
    }

    renderBlogLink() {
        const { comment, blog, classes } = this.props

        return <Link
            className={classes.commentTitle}
            to={blog ? `/admin/blog/${blog.id}` : 'javascript:void(0)'}
        >
            <StatusIcon state={comment.state} alive={comment.alive} />
            {
                blog
                    ? comment && comment.ref
                        ? `RE:RE: ${blog.title}`
                        : `RE: ${blog.title}`
                    : 'loading...'
            }
        </Link>
    }

    renderFooter() {
        const { user, comment, classes } = this.props
        return <footer className={classes.commentFooter}>
            <div className={classes.time}>{timeFormat(new Date(comment.time * 1000), 'yyyy-mm-dd hh:MM:ss')}</div>
            {comment.alive
                ? <div className={classes.buttons}>
                    {comment.state == CommentState.REVIEWING ? <Button classes={{ root: classes.button }} onClick={this.passComment}>通过</Button> : null}
                    {comment.state == CommentState.REVIEWING ? <Button classes={{ root: classes.button }} onClick={this.blockComment}>拉黑</Button> : null}
                    {
                        user.level == UserLevel.DOUBTED && comment.state == CommentState.IMPLICATED
                            ? <Button classes={{ root: classes.button }} onClick={this.censorUser}>置信检查</Button>
                            : null
                    }
                    <Button classes={{ root: classes.button }} onClick={this.deleteComment}>删除</Button>
                </div>
                : <div className={classes.buttons}>
                    <Button classes={{ root: classes.button }} onClick={this.revertComment}>设为可见</Button>
                </div>}
        </footer>
    }

    deleteComment = () => api.deleteComment(this.props.comment.id)

    revertComment = () => api.revertComment(this.props.comment.id)

    passComment = () => api.passComment(this.props.comment.id)

    censorUser = () => api.censorUser(this.props.user.id)

    blockComment = () => api.blockComment(this.props.comment.id)

    render() {
        const { comment, classes } = this.props

        return <Card classes={{ root: classes.root }} >
            <CardContent classes={{ root: classes.container, }}>
                {this.renderUserInfo()}
                <div className={classes.main}>
                    {this.renderBlogLink()}
                    <div className={classes.commentContent}>
                        {comment && comment.content}
                    </div>
                    {this.renderFooter()}
                </div>
            </CardContent>
        </Card>
    }
}

interface AvatarProps {
    classes: { root?: string }
    src: string,
}
const Avatar = ({ classes, src }: AvatarProps) => (
    <div className={classes.root} style={{
        backgroundImage: `url(${src})`
    }}></div>
)

const withCommentStyle = withStyles(styles)
export default withCommentStyle(CommentItem) as React.ComponentClass<CommentItemProps>

class _CommentItemLight extends CommentItem<{}> {
    renderUserInfo() {
        return null as JSX.Element
    }
}

export const CommentItemLight = withCommentStyle(_CommentItemLight) as React.ComponentClass<CommentItemProps>

class _BlogCommentItem extends CommentItem<{ refComment: Comment, refUser: User, classes?: void }> {
    renderRef() {
        const { refComment, refUser, classes } = this.props
        if (refComment && refUser) {
            return <div className={classes.refComment}>
                @{refUser.name}: {refComment.content.slice(0, 100).split('\n').slice(0, 4).join('\n')}
            </div>
        } else {
            return null
        }
    }
    renderUserInfo() {
        const { user, classes } = this.props

        return <Link className={classes.userInfo} to={`/admin/user/${user.id}`}>
            <Avatar
                src={user.avatar}
                classes={{ root: `${classes.avatar} ${classes.avatarSmall}` }}
            />
            <div className={classes.userName} >{user.name}</div>
        </Link>
    }
    render() {
        const { comment, classes } = this.props

        return <Card classes={{ root: classes.root }} >
            <CardContent classes={{ root: classes.container, }}>
                {this.renderUserInfo()}
                <div className={classes.blogCommentMain}>
                    {this.renderRef()}
                    <div className={classes.commentContent}>
                        {comment && comment.content}
                    </div>
                    {this.renderFooter()}
                </div>
            </CardContent>
        </Card>
    }
}

export const BlogCommentItem = withCommentStyle(_BlogCommentItem) 