import * as React from 'react'
import { match as Match } from 'react-router'
import { Link } from 'react-router-dom'
import { History } from 'history'
import { timeFormat } from './utils'
import { List, Tag, Blog, Basic } from './models'
import { parse as _marked } from 'marked'

interface ListViewProps {
    history: History,
    nextPage: number,
    tag: Tag,
    tagname: string,
    loading: boolean,
    blogs: Blog[],
    fetchList: (tag: string, page: number) => Promise<any>,
}
declare let __basic: Basic

export default class ListView extends React.Component<ListViewProps> {
    componentWillMount() {
        this.compute(this.props)
        document.addEventListener('scroll', this.handleScroll)
        window.scrollTo(0, 0)
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.handleScroll)
    }

    componentWillReceiveProps(next: ListViewProps) {
        this.compute(next)
    }

    handleScroll = () => {
        if (this.props.loading) {
            return
        }

        if (!this.props.nextPage) {
            // 已经抵达最后一页
            return
        }

        const anchor = this.refs.more as HTMLElement
        if (anchor) {
            if (anchor.offsetTop + anchor.clientHeight <= window.scrollY + window.innerHeight) {
                this.props.fetchList(this.props.tagname, this.props.nextPage)
                console.log('should fetch') // for safe
            }
        } else {
            // never
            // 理论上不会出现这种情况
            console.warn('出错了')
        }
    }

    compute(props: ListViewProps) {
        if (props.loading) {
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
            return this.props.fetchList(props.tagname, 1)
        }

        // 好，这里拿到文章了
        if (this.props.tagname != props.tagname) {
            window.scrollTo(0, 0)
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
                                <Link className="list-blog-readmore" to={`/blog/${blog.id}`}>阅读全文</Link>
                            </div>
                            <div className="list-blog-tags">
                                {blog.tags.map(t => <Link to={`/tag/${t}`} className="list-blog-tag" key={t}>{t}</Link>)}
                            </div>
                        </article>
                    }) : null
                }
            </div>
            {
                this.props.loading
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