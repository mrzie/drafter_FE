import * as React from 'react'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { Grid, Card } from 'material-ui'
import { CardContent } from 'material-ui/Card'
import { connect, MapStateToProps } from 'react-redux'
import { match as Match } from 'react-router'
import { History } from 'history'
import { State, Comment, CommentLoadState, User, Blog } from '../../model'
import { CommentItemLight } from '../comments/commentItem'
import EmptyText from '../comments/emptyText'

interface UserCommentReduxProps {
    comments: Comment[],
    loadMarks: {
        [name: string]: CommentLoadState;
    },
    user: User,
    blogs: Blog[],
}

interface UserCommentPageProps {
    match: Match<{ id: string }>,
    history: History,
}

interface StylesProps {
    classes: any,
}

type UserCommentProps = UserCommentReduxProps & UserCommentPageProps & StylesProps

interface CommentViewState {

}


class CommentView extends React.Component<UserCommentProps, CommentViewState> {
    state: CommentViewState = {

    }

    render() {
        const { classes, user, comments, blogs } = this.props
        if (!user) return <div />
        return <div className={classes.container}>
            <Grid container justify="center">
                <Grid item md={6}>
                    <Card>
                        <CardContent classes={{ root: classes.userPanel }}>
                            <div className={classes.avatar} style={{
                                backgroundImage: `url(${user.avatar})`
                            }} />
                            <div>{user.name}</div>
                        </CardContent>
                    </Card>
                    {comments.map(c => (
                        <CommentItemLight
                            comment={c}
                            user={user}
                            blog={blogs.find(b => b.id === c.blog)}
                            key={c.id}
                        />
                    ))}
                    {comments.length == 0 && <EmptyText />}

                </Grid>
            </Grid>
        </div>
    }
}

const styles: StyleRulesCallback = theme => ({
    container: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100vh',
        paddingTop: '30px',
        boxSizing: 'border-box',
    },
    avatar: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    userPanel: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '15px',
    },
})

const mapStateToProps: MapStateToProps<UserCommentReduxProps, UserCommentPageProps> = (state: State, ownProps) => {
    const { id } = ownProps.match.params
    return {
        comments: state.comments.filter(c => c.user === id),
        user: state.users.find(u => u.id === id),
        loadMarks: state.interactions.commentLoadMarks,
        blogs: state.blogs,
    }
}

export default withStyles(styles)(connect(mapStateToProps)(CommentView) as React.ComponentClass<{ classes: any, theme?: any }>)