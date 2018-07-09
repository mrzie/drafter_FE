import * as React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { History } from 'history'
import { timeFormat } from './utils'
import { Blog, Basic, State } from './models'
import CommentsView from './comments/'
import * as apis from './apis'
import { connect, MapStateToProps } from 'react-redux'

declare let __basic: Basic

declare let PR: {
    prettyPrint: () => void
}

interface BlogViewProps {
    id: string,
    blog: Blog,
    isLoading: boolean,
    history: History,
}

class BlogView extends React.Component<BlogViewProps> {
    fetchBlogIfNeed(props: BlogViewProps) {
        if (props.isLoading) {
            return
        }

        const { id, blog } = this.props

        if (props != this.props && !blog) {
            // 这里是nextProps
            // 而且博客还是没拿到
            // 大概是废了
            // 跳404吧
            this.props.history.push('/error')
            return
        }

        if (!blog) {
            document.title = 'Loading...'
            console.log(this.props)
            return apis.fetchBlog(id)
        }
        // 好，这里拿到文章了
        if (this.props == props || this.props.id != props.id) {
            window.scrollTo(0, 0)
            document.title = `${blog.title} | ${__basic.sitename}`
        }
    }

    componentWillMount() {
        this.fetchBlogIfNeed(this.props)
    }

    componentWillReceiveProps(nextProps: BlogViewProps) {
        this.fetchBlogIfNeed(nextProps)
    }

    render() {
        const { isLoading, blog, id } = this.props
        return <div>
            {isLoading && <div>loading...</div>}
            {blog && <BlogMain blog={blog} />}
            {blog && <CommentsView id={id} />}
        </div>
    }
}

const BlogMain = ({ blog }: { blog: Blog }) => {
    const timeContent = blog.createAt == blog.editAt
        ? `创建于${timeFormat(new Date(blog.createAt), 'yyyy年m月d日 hh:MM')}`
        : `创建于${timeFormat(new Date(blog.createAt), 'yyyy年m月d日 hh:MM')}，修改于${timeFormat(new Date(blog.editAt), 'yyyy年m月d日 hh:MM')}`

    return (
        <article className="blog-container">
            <div className="blog-title">{blog.title}</div>
            <div className="blog-time">{timeContent}</div>
            <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: blog.content || '' }}
                ref={el => {
                    if (!el) {
                        return
                    }
                    // 我也不知道为什么一定要节点操作
                    // 为什么google的prettyprint也用了这么麻烦的写法
                    // fine
                    const list: HTMLPreElement[] = []
                    el.querySelectorAll('pre').forEach(pre => {
                        const child = pre.firstElementChild
                        if (child && child.nodeName === 'CODE' && child.className) {
                            pre.classList.add('prettyprint')
                            list.push(pre)
                        }
                    })
                    try {
                        if (PR) {
                            PR.prettyPrint()
                            list.forEach(pre => {
                                const nums = document.createElement('div')
                                nums.classList.add('linenums-wrapper')
                                nums.innerText = pre.querySelector('code').innerText.split('\n').map((_, index) => index + 1 + '.').join('\n')
                                pre.insertBefore(nums, pre.firstChild)
                            })
                            // 好吧代码到这里已经非常丑了
                            // 想要实现一行代码过长的时候左右滚动而不是换行 + 行号位置固定不滚动
                            // 最后写了个flex布局。。
                            // 本来想让窄屏幕下隐藏行号，不过看了一下iphone SE的宽度都能放得下
                            // fine
                        }
                    } catch (e) {

                    }
                }}
            ></div>
            <div className="blog-tags">
                {blog.tags.map(t => <Link to={`/tag/${t}`} className="blog-tag" key={t}>{t}</Link>)}
            </div>
        </article>
    )
}

const mapStateToProps: MapStateToProps<BlogViewProps, RouteComponentProps<{ id: string }>, State> = (state, ownProps) => {
    const { id } = ownProps.match.params
    return {
        id,
        blog: state.blogs.find(b => b.id == id),
        isLoading: state.loadStack.indexOf(`blog.${id}`) > -1,
        history: ownProps.history,
    }
}

export default connect(mapStateToProps, null)(BlogView)