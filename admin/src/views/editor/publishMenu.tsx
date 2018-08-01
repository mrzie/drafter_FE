/**
 * 这个组件就是点击发布的时候弹出来的那个菜单
 * 因为还涉及到请求博客接口感觉挺麻烦的
 * 放在外部还会影响整块editor刷新
 * 算了还是写个组件好了
 */

import * as React from 'react'
import { State, Blog } from '../../model'
import { Menu, MenuItem, Divider } from 'material-ui'
import * as api from '../../api'
import { isBlogBusy, timeFormat } from '../../utils'
import { connect } from 'react-redux'



interface PublishMenuOwnProps {
    open: boolean,
    isComposing: boolean,
    noteid: string,
    anchorEl: HTMLElement,
    onRequestClose: () => void,
    onPublish: () => any,
    onEditToBlog: (id: string, noteid: string) => any,
}

interface PublishMenuProps extends PublishMenuOwnProps {
    isLoadingBlogs: boolean,
    blogsSyncAt: number,
    isComposing: boolean,
    blogs: Blog[],
    loadings: string[],
}

class PublishMenu extends React.Component<PublishMenuProps, null>{
    relativeBlogs: Blog[] = []
    componentWillReceiveProps(next: PublishMenuProps) {
        if (next.open) {
            if (!this.props.open) {
                // 刚刚打开的兄弟，要不要判断一下有没有新博客啊
                api.getBlogsIfNeed()
            }
            this.relativeBlogs = next.blogs.filter(b => b.noteid === next.noteid)
        }
    }
    handleEditToBlog: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement | HTMLLIElement> = async e => {
        const
            id = e.currentTarget.getAttribute('data-id'),
            noteid = this.props.noteid
        this.props.onEditToBlog(id, noteid)
    }
    render() {
        return <Menu
            open={this.props.open}
            onRequestClose={this.props.onRequestClose}
            anchorEl={this.props.anchorEl}>
            <MenuItem
                onClick={this.props.onPublish}
                disabled={this.props.isComposing}
            >
                发布新作
            </MenuItem>
            {this.props.isLoadingBlogs && <MenuItem disabled={true}>
                loading...
            </MenuItem>}
            {
                this.relativeBlogs.length && [
                    <Divider key="divider" />,
                    ...this.relativeBlogs.map(blog => <MenuItem
                        key={blog.id}
                        data-id={blog.id}
                        onClick={this.handleEditToBlog}
                        disabled={isBlogBusy(blog.id, this.props.loadings)}
                    >
                        更新至 {blog.title} ({timeFormat(new Date(blog.createAt), "yyyy-m-d hh:MM")})
                    </MenuItem>)
                ]
            }
        </Menu>
    }
}

const mapStateToProps = (state: State, ownProps: PublishMenuOwnProps) => {
    return {
        ...ownProps,
        loadings: state.interactions.loadings,
        isLoadingBlogs: state.interactions.loadings.indexOf('GETBLOGS') > -1,
        blogsSyncAt: state.interactions.blogsSyncAt,
        isComposing: ownProps.open && ownProps.isComposing,
        blogs: state.blogs,
    }
}

export default connect(mapStateToProps)(PublishMenu)