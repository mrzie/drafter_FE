import * as React from 'react'
import { State, Blog } from '../../model'
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
import Slide from 'material-ui/transitions/Slide'
import { parse as marked } from 'marked'
import { Visibility, VisibilityOff, Delete, Edit } from 'material-ui-icons'
import * as api from '../../api'
import { History } from 'history'
import { match as Match } from 'react-router-dom'
import { ModalRange, getModalRangeId } from '../modal'
import { isBlogBusy } from '../../utils'
import { connect } from 'react-redux'

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
    // tip: {

    // },
    // buttons: {

    // }
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
    }
}


interface BlogPreviewProps {
    blog: Blog,
    isLoading: boolean,
    isBusy: boolean,
    match: Match<{ id: string }>,
    history: History,
    classes: any,
}

interface BlogPreviewOuterProps {
    match: Match<{ id: string }>,
    history: History,
}

interface BlogPreviewState {

}

const { $blog } = api

class BlogPreview extends React.Component<BlogPreviewProps, BlogPreviewState> {
    // state = {
    //     isViewSource: false,
    //     restoreDialogOpen: false,
    //     restoreDialogText: '',
    //     restoreTargetNotebook: '',
    // }
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
        $blog.handleHideBlog(this.props.blog)
    }

    onRequestRestore = () => {
        $blog.handleRestoreBlog(this.props.blog)
    }

    onRequestDelete = () => {
        $blog.handleDeleteBlog(this.props.blog)
    }

    onRequestEdit = () => {
        $blog.handleEditBlog(this.props.blog, this.props.history, this.modalRangeId)
    }

    render() {
        const { blog, isLoading, isBusy } = this.props

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
                <Grid item xs={10} sm={10} md={9} lg={9}>
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
            </Grid>
            <ModalRange id={this.modalRangeId} />

        </div >
    }
}

export default withStyles(styles)(connect(mapStateToProps)(BlogPreview))