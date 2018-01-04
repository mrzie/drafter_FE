import * as React from 'react'
import { Grid, Card, Chip, CircularProgress, MenuItem, LinearProgress } from 'material-ui'
import { withStyles, StyleRulesCallback } from 'material-ui/styles'
import { connect } from 'react-redux'
import { State, Blog } from '../../model'
import * as api from '../../api'
import { timeFormat } from '../../utils'
import Stepper from './listStepper'
import FlexMenu from '../../utils/flexMenu'
import { History } from 'history'
import { ModalRange, getModalRangeId } from '../modal'
import { isBlogBusy } from '../../utils'
import { Link } from 'react-router-dom'
import { Description } from 'material-ui-icons'

// const mapStateToProps = (state: State) => ({
//     blogs: state.blogs
// })

const styles: StyleRulesCallback = theme => ({
    // container: {
    //     width: '100%',
    //     maxHeight: '100vh',
    // },
    // header: {
    //     height: '50px',
    // },
    blogItem: {
        margin: '10px',
        padding: '16px 16px 24px',
        fontWeight: 300,
        position: 'relative',
    },
    blogItemHidden: {
        opacity: .6,
    },
    blogTitle: {

        fontSize: '1.5em',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontWeight: 500,
        marginBottom: '10px',
        '&:empty:before': {
            content: '"（无标题）"',
            opacity: .5
        }
    },
    blogTime: {
        fontSize: '.9em',
        color: '#3b8adb',
    },
    blogAbstract: {
        lineHeight: '18px',
        margin: '15px 0',
        overflow: 'hidden',
    },
    blogTags: {
        display: 'flex',
        zoom: 0.7,
    },
    circularProgress: {
        display: 'block',
        color: '#3b8adb',
        margin: '20px auto',
    },
    stepperBox: {
        display: 'flex',
        justifyContent: 'center',
        margin: '20px 0',
    },
    stepperInput: {
        WebkitAppearance: 'none',
        MozAppearance: 'textField',
        height: '32px',
        lineHeight: '32px',
        width: '88px',
        border: '0',
        fontSize: 'inherit',
        background: 'none',
        '&:focus': {
            outline: 'none',
        },
    },

    itemProgress: {
        position: 'absolute',
        bottom: '0',
        width: '100%',
    },
    itemProgressColor: {
        backgroundColor: '#3b8adb',
    },
    itemProgressBar: {
        backgroundColor: '#fff',
    },
    link: {
        textDecoration: 'none',
        color: '#000',
    },
    linkToNotes: {
        color: '#ccc',
        textDecoration: 'none',
        transition: 'color .2s ease-in',
        '&:hover': {
            color: '#999',
        }
    },
    emptyHolder: {
        fontSize: '1.5em',
        color: '#ccc',
    },
})

interface BlogsListProps {
    blogs: Blog[],
    classes: any,
    loadings: string[],
    filter: (blogs: Blog[]) => Blog[],
    history: History,
}

interface BlogsListOuterProps {
    blogs: Blog[],
    loadings: string[],
    filter: (blogs: Blog[]) => Blog[],
    history: History,
}

interface BlogsListState {
    page: number,
    blogs: Blog[],
    maxPage: number,
    menuAnchorX: number,
    menuAnchorY: number,
    contextMenuTarget: Blog,
}

const
    cap = 12,
    menuNOOP = (e: React.MouseEvent<any>) => e.preventDefault(),
    $blog = api.$blog

class BlogsList extends React.Component<BlogsListProps, BlogsListState> {
    state: BlogsListState = {
        page: 1,
        blogs: [],
        maxPage: 1,
        menuAnchorX: 0,
        menuAnchorY: 0,
        contextMenuTarget: null,
    }

    modalRangeId: number = getModalRangeId()


    componentWillMount() {
        this.fetchBlogIfNeed(this.props)
    }

    fetchBlogIfNeed(props: BlogsListProps, page?: number) {
        let
            pid = page || this.state.page,
            blogs = props.filter(props.blogs) || [],
            maxPage = Math.ceil(blogs.length / cap)

        if ((pid - 1) * cap > blogs.length) {
            pid = maxPage
            this.setState({ page: pid })
        } else if (page && page > 0) {
            this.setState({ page })
        }

        blogs = blogs.slice((pid - 1) * cap, pid * cap)

        this.setState({ blogs, maxPage })

        const unloaded = blogs.filter(b => b.content === undefined && this.props.loadings.indexOf('GETBLOG.' + b.id) === -1)
        if (unloaded.length) {
            api.getBlog(unloaded.map(b => b.id))
        }
    }

    onBlogEditRequest = () => {
        $blog.handleEditBlog(this.state.contextMenuTarget, this.props.history, this.modalRangeId)
        this.setState({ contextMenuTarget: null })
    }

    onBlogHideRequest = () => {
        $blog.handleHideBlog(this.state.contextMenuTarget)
        this.setState({ contextMenuTarget: null })
    }

    onBlogRestoreRequest = () => {
        $blog.handleRestoreBlog(this.state.contextMenuTarget)
        this.setState({ contextMenuTarget: null })
    }

    onBlogRemoveRequest = () => {
        $blog.handleDeleteBlog(this.state.contextMenuTarget)
        this.setState({ contextMenuTarget: null })
    }

    onContextMenuClose = () => {
        this.setState({ contextMenuTarget: null })
    }

    componentWillReceiveProps(next: BlogsListProps) {
        this.fetchBlogIfNeed(next)
    }

    handlePageChange = (page: number) => {
        this.fetchBlogIfNeed(this.props, page)
    }

    handlePreviewBlog = () => {
        this.props.history.push(`/admin/blog/${this.state.contextMenuTarget.id}`)
    }

    // isBlogBusy(id: string) {
    //     // let prefix
    //     // const loadings = this.props.loadings
    //     // for (prefix of ['ACTIVATEBLOG.', 'EDITBLOG.', 'DELETEBLOG.']) {
    //     //     if (loadings.indexOf(prefix + id) > -1) {
    //     //         return true
    //     //     }
    //     // }
    //     // return false
    // }

    renderMenuItem(target: Blog) {
        if (!target) {
            return [] as JSX.Element[]
        }

        if (target.alive) {
            return [
                <MenuItem onClick={this.handlePreviewBlog} key="preview">
                    查看
                </MenuItem>,
                <MenuItem onClick={this.onBlogEditRequest} key="edit">
                    编辑
                </MenuItem>,
                <MenuItem onClick={this.onBlogHideRequest} key="hide">
                    对读者隐藏
                </MenuItem>
            ]
        } else {
            return [
                <MenuItem onClick={this.handlePreviewBlog} key="preview">
                    查看
                </MenuItem>,
                <MenuItem onClick={this.onBlogEditRequest} key="edit">
                    编辑
                </MenuItem>,
                <MenuItem onClick={this.onBlogRestoreRequest} key="restore">
                    对读者可见
                </MenuItem>,
                <MenuItem onClick={this.onBlogRemoveRequest} key="delete">
                    永久删除
                </MenuItem>
            ]
        }
    }

    onBlogContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        const id = e.currentTarget.getAttribute('data-id')

        if (isBlogBusy(id, this.props.loadings)) {
            return
        }
        const blog = this.props.blogs.find(b => b.id === id)

        if (blog) {
            this.setState({
                contextMenuTarget: blog,
                menuAnchorX: e.clientX,
                menuAnchorY: e.clientY,
            })
        }
    }

    render() {
        const
            { classes, loadings } = this.props,
            blogs = this.state.blogs,
            { contextMenuTarget } = this.state

        if (loadings.indexOf('GETBLOGS') > -1) {
            return <div>
                <CircularProgress className={classes.circularProgress} />
                <ModalRange id={this.modalRangeId} />
            </div>
        }

        if (blogs.length == 0) {
            return <div>
                <div className={classes.emptyHolder}>发布<Link to="/admin/notebook" className={classes.linkToNotes}><Description />笔记</Link>到博客，和朋友分享你的所思所想。</div>
                <ModalRange id={this.modalRangeId} />
            </div>
        }

        return <div>
            {blogs.map(blog => {
                const rootClass = [classes.blogItem]
                if (!blog.alive) {
                    rootClass.push(classes.blogItemHidden)
                }
                return <Card key={blog.id} className={rootClass.join(' ')} data-id={blog.id} onContextMenu={this.onBlogContextMenu}>

                    <Link to={"/admin/blog/" + blog.id} className={classes.link}>
                        <div className={classes.blogTitle}>{blog.title}</div>
                    </Link>
                    <div className={classes.blogTime}>创建于{timeFormat(new Date(blog.createAt), 'yyyy年m月d日 hh:MM')}，修改于{timeFormat(new Date(blog.editAt), 'yyyy年m月d日 hh:MM')}</div>

                    {
                        blog.content !== undefined
                            ? <div className={classes.blogAbstract}>{blog.content.slice(0, 100)}</div>
                            : <CircularProgress className={classes.circularProgress} />
                    }
                    <div className={classes.blogTags}>
                        {(blog.tags || []).map(tag => <Chip
                            key={tag}
                            label={tag}
                        />)}
                    </div>
                    {
                        isBlogBusy(blog.id, loadings)
                            ? <LinearProgress classes={{
                                root: this.props.classes.itemProgress,
                                primaryColor: this.props.classes.itemProgressColor,
                                primaryColorBar: this.props.classes.itemProgressBar,
                            }} />
                            : null
                    }
                </Card>
            })}

            <Stepper
                total={this.state.maxPage}
                current={this.state.page}
                onPageChange={this.handlePageChange}
                classes={{ box: classes.stepperBox, input: classes.stepperInput }}
            />

            <FlexMenu
                x={this.state.menuAnchorX}
                y={this.state.menuAnchorY}
                open={!!contextMenuTarget}
                onRequestClose={this.onContextMenuClose}
            >
                {this.renderMenuItem(contextMenuTarget)}
            </FlexMenu>
            <ModalRange id={this.modalRangeId} />

        </div>
    }
}

export default withStyles(styles)(BlogsList) as React.ComponentClass<BlogsListOuterProps>