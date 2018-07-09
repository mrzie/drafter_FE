import * as React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { History } from 'history'
import { timeFormat } from './utils'
import { Tag, Blog, Basic, State } from './models'
import { parse as _marked } from 'marked'
import { MapStateToProps, connect } from 'react-redux'
import * as apis from './apis'

declare let __basic: Basic

interface ListViewProps {
    isLoading: boolean,
    history: History,
    blogs: Blog[],
    tag: Tag,
    nextPage: number,
    tagname: string,
}

const mapStateToProps: MapStateToProps<ListViewProps, RouteComponentProps<{ tag?: string }>, State> = (state, ownProps) => {
    const tagname = ownProps.match.params.tag || ''
    const listMatched = state.lists.find(l => l.query === tagname)
    // const nextPage = listMatched ? 
    if (listMatched) {
        const
            ids = [].concat(...listMatched.blogs),
            blogs = state.blogs.filter(b => ids.indexOf(b.id) != -1),
            nextPage = ids.length >= listMatched.count ? null : (listMatched.blogs.length + 1)

        return {
            isLoading: state.loadStack.indexOf(`list.${tagname}.${nextPage}`) > -1,
            history: ownProps.history,
            blogs,
            tag: state.tags.find(t => t.name === tagname),
            nextPage,
            tagname,
        }
    } else {
        const
            nextPage: number = null,
            blogs: Blog[] = null

        return {
            isLoading: state.loadStack.indexOf(`list.${tagname}.${nextPage}`) > -1,
            history: ownProps.history,
            blogs,
            tag: state.tags.find(t => t.name === tagname),
            nextPage,
            tagname,
        }
    }
}

class ListView extends React.Component<ListViewProps> {
    componentWillMount() {
        this.fetchListIfNeed(this.props)
        document.addEventListener('scroll', this.handleScroll)
        window.scrollTo(0, 0)
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.handleScroll)
    }

    componentWillReceiveProps(next: ListViewProps) {
        this.fetchListIfNeed(next)
    }

    fetchListIfNeed(props: ListViewProps) {
        if (props.isLoading) {
            return
        }

        if (this.props == props || this.props.tagname != props.tagname) {
            // 是初始化，或者修改了tagname
            document.title = props.tagname ? `『${props.tagname}』 - ${__basic.sitename}` : __basic.sitename
        }

        if (!props.blogs) {
            // 这里list没拿到，可能是请求失败了，可能是刚切换过来还没请求
            // 我真希望用户不要玩url，但是web端这是不可能的吧
            if (this.props != props && this.props.tagname == props.tagname) {
                // 同一篇文章，Loading已经不转了，然而你还是没有内容
                // 大概是废了
                // 跳404吧
                // debugger
                return this.props.history.push('/error')
            }
            // if (this.props.nextPage != 1) {
            //     // 那你的意思是我的代码写得有问题咯？
            // }
            // 冷静一点，只是还没请求
            return apis.fetchList(props.tagname, 1)
        }

        // 好，这里拿到文章了
        if (this.props.tagname != props.tagname) {
            window.scrollTo(0, 0)
        }
    }

    handleScroll = () => {
        if (this.props.isLoading) {
            return
        }

        if (!this.props.nextPage) {
            // 已经抵达最后一页
            return
        }

        const anchor = this.refs.more as HTMLElement
        if (anchor) {
            if (anchor.offsetTop + anchor.clientHeight <= window.scrollY + window.innerHeight) {
                apis.fetchList(this.props.tagname, this.props.nextPage)
                console.log('should fetch') // for safe
            }
        } else {
            // never
            // 理论上不会出现这种情况
            console.warn('出错了')
        }
    }

    render() {
        const { tag, blogs } = this.props
        return <div className="list-wrapper">
            {
                tag
                    ? <div className="tag-info">
                        <div className="tag-title">{tag.name}</div>
                        <div className="tag-count">共{tag.count}篇文章。</div>
                        <div className="tag-description" dangerouslySetInnerHTML={{ __html: _marked(tag.description, { breaks: true }) || '' }} ></div>
                    </div>
                    : null
            }
            <div className="blog-list">
                {
                    blogs ? blogs.map(blog => {
                        const
                            id = blog.id,
                            timeContent = timeFormat(new Date(blog.createAt), 'yyyy年m月d日 hh:MM')
                        return < article className="list-blog" key={id}>
                            <Link className="list-blog-title" to={`/blog/${id}`}>{blog.title}</Link>
                            <div className="list-blog-time">{timeContent}</div>
                            <div className="list-blog-content">
                                <div
                                    className="list-blog-abstract"
                                    dangerouslySetInnerHTML={{ __html: blog.abstract || '' }}
                                />
                                <Link className="list-blog-readmore cyan-link" to={`/blog/${blog.id}`}>阅读全文</Link>
                            </div>
                            <div className="list-blog-tags">
                                {blog.tags.map(t => <Link to={`/tag/${t}`} className="list-blog-tag" key={t}>{t}</Link>)}
                            </div>
                        </article>
                    }) : null
                }
            </div>
            {
                this.props.isLoading
                    ? <div className="load-more">loading...</div>
                    : this.props.nextPage
                        ? <div ref="more" className="load-more">查看更多</div>
                        : <div className="load-more">后面没有啦</div>
            }
        </div>
    }

    componentDidUpdate() {
        this.handleScroll()
    }
}

export default connect(mapStateToProps, null)(ListView)