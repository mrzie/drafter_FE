import * as React from 'react'
import { State, Blog, CommentLoadState, Comment } from '../../model'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import {
    Paper,
    Grid,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
    Button,
    MenuItem,
} from 'material-ui'
import { parse as marked } from 'marked'
import { Visibility, VisibilityOff, Delete, Edit } from 'material-ui-icons'
import * as api from '../../api'
import { History } from 'history'
import { match as Match } from 'react-router-dom'
import { ModalRange, getModalRangeId } from '../modal'
import { isBlogBusy } from '../../utils'
import { connect } from 'react-redux'
import BlogComments from '../commentView/blogCommentsView'

const styles: StyleRulesCallback = theme => ({
    container: {
        width: '100%',
        overflowX: 'hidden',
        height: '100%',
    },
    tagsWrapper: {
        display: 'flex',
        zoom: 0.7,
        marginBottom: '20px',
    },
    header: {
        height: '50px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '.9rem',
    },
    blog: {
        padding: '24px',
        height: 'calc(100vh - 106px)',
        overflow: 'auto',
    },
    blogComments: {
        height: 'calc(100vh - 42px)',
        overflowY: 'auto',
    },
})

const mapStateToProps = (state: State, ownProps: BlogPreviewOuterProps) => {
    const id = ownProps.match.params.id,
        loadings = state.interactions.loadings,
        isLoading = loadings.indexOf('GETBLOG.' + id) > -1,
        isBusy = isLoading || isBlogBusy(id, loadings)//!!['ACTIVATEBLOG.', 'DELETEBLOG.', 'EDITBLOG.'].find(s => loadings.indexOf(s + id) > -1)

    return {
        // loadings: state.interactions.loadings,
        blog: state.blogs.find(b => b.id === id),
        isLoading,
        isBusy,
        commentsLoading: state.interactions.commentLoadMarks[`blog=${id}`] === CommentLoadState.LOADING,
        comments: state.comments.filter(c => c.blog === id),
    }
}


interface BlogPreviewProps {
    blog: Blog,
    isLoading: boolean,
    isBusy: boolean,
    match: Match<{ id: string }>,
    history: History,
    classes: any,
    commentsLoading: boolean,
    comments: Comment[],
}

interface BlogPreviewOuterProps {
    match: Match<{ id: string }>,
    history: History,
}

interface BlogPreviewState {

}


class BlogPreview extends React.Component<BlogPreviewProps, BlogPreviewState> {
    modalRangeId: number = getModalRangeId()

    componentWillMount() {
        if ((!this.props.blog || !this.props.blog.content) && !this.props.isLoading) {
            api.getBlog([this.props.match.params.id])
        }
    }

    componentWillReceiveProps(next: BlogPreviewProps) {
        if ((!next.blog || !next.blog.content) && !next.isLoading) {
            // 即将进入的页面博客不存在或未加载
            if (next.match.params.id == this.props.match.params.id) {
                // 没治了，加载不到
                this.props.history.push('/admin/')
            } else {
                // 只是从一篇博客切换到了另一篇
                api.getBlog([next.match.params.id])
            }
        }
    }

    onRequestHidden = () => {
        api.handleHideBlog(this.props.blog)
    }

    onRequestRestore = () => {
        api.handleRestoreBlog(this.props.blog)
    }

    onRequestDelete = () => {
        api.handleDeleteBlog(this.props.blog)
    }

    onRequestEdit = () => {
        api.handleEditBlog(this.props.blog, this.props.history, this.modalRangeId)
    }

    onRequestGetComments = () => {
        if (this.props.commentsLoading || !this.props.blog) {
            return
        }
        return api.fetchCommentsByBlog(this.props.match.params.id)
    }

    render() {
        const { blog, isLoading, isBusy, commentsLoading, comments } = this.props

        if (!blog) {
            return <div>
                <ModalRange id={this.modalRangeId} />
            </div>
        }

        return <div className={this.props.classes.container}>
            <div className={this.props.classes.header}>
                <div></div>
                <div className={this.props.classes.buttons}>
                    <Tooltip label="Edit" title="编辑" placement="bottom" >
                        <IconButton disabled={isBusy} onClick={this.onRequestEdit}>
                            <Edit />
                        </IconButton>
                    </Tooltip>
                    {
                        blog.alive
                            ? <Tooltip label="Hide" title="设为隐藏" placement="bottom" >
                                <IconButton disabled={isBusy} onClick={this.onRequestHidden}>
                                    <Visibility />
                                </IconButton>
                            </Tooltip>
                            : <Tooltip label="Restore" title="设为可见" placement="bottom" >
                                <IconButton disabled={isBusy} onClick={this.onRequestRestore}>
                                    <VisibilityOff />
                                </IconButton>
                            </Tooltip>
                    }
                    {
                        <Tooltip label="Delete" title="永久删除" placement="bottom" >
                            <IconButton disabled={isBusy || blog.alive} onClick={this.onRequestDelete}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    }
                </div>
            </div>
            <Grid container justify="center">
                <Grid item xs={6} sm={6} md={6} lg={6}>
                    {blog
                        ? <Paper className={this.props.classes.blog} >
                            <h1>{blog.title}</h1>
                            <div className={this.props.classes.tagsWrapper}>{blog.tags.map((tag, index) => <Chip
                                label={tag}
                                key={index}
                                classes={{ root: this.props.classes.chip }}
                            />)}</div>
                            {isLoading ? <CircularProgress /> : null}
                            <div dangerouslySetInnerHTML={{ __html: marked(blog.content || '', { breaks: true }) }} className="markdown-body">
                            </div>
                        </Paper>
                        : <Paper className={this.props.classes.blog} >
                            <CircularProgress />
                        </Paper>
                    }
                </Grid>
                <Grid item xs={5} sm={5} md={5} lg={5} classes={{ typeItem: this.props.classes.blogComments }}>
                    <BlogComments id={this.props.blog.id} />
                </Grid>
            </Grid>
            <ModalRange id={this.modalRangeId} />

        </div >
    }
}

export default withStyles(styles)(connect(mapStateToProps)(BlogPreview))