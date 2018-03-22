import * as React from 'react'
import { match as Match } from 'react-router'
import { Link } from 'react-router-dom'
import { History } from 'history'
import { timeFormat } from './utils'
import { Blog, Basic } from './models'

interface BlogViewProps {
    id: string,
    history: History,
    loading: boolean,
    blogs: Blog[],
    fetchBlog: (id: string) => Promise<any>,
}

declare let __basic: Basic

declare let PR: {
    prettyPrint: () => void
}

export default class BlogView extends React.Component<BlogViewProps> {
    blog: Blog = null

    checkBlog(props: BlogViewProps) {
        if (props.loading) {
            return
        }

        const
            id = props.id,
            blog = props.blogs.find(b => b.id == id)

        if (props != this.props && !blog) {
            // 这里是nextProps
            // 而且博客还是没拿到
            // 大概是废了
            // 跳404吧
            this.props.history.push('/error')
            return
        }

        this.blog = blog
        if (!blog) {
            document.title = 'Loading...'
            return props.fetchBlog(id)
        }
        // 好，这里拿到文章了
        if (this.props == props || this.props.id != props.id) {
            window.scrollTo(0, 0)
            document.title = `${blog.title} | ${__basic.sitename}`
        }
    }

    componentWillMount() {
        this.checkBlog(this.props)
    }

    componentWillReceiveProps(nextProps: BlogViewProps) {
        this.checkBlog(nextProps)
    }

    render() {
        const
            blog = this.blog,
            loading = this.props.loading

        let timeContent
        if (blog.createAt == blog.editAt) {
            timeContent = `创建于${timeFormat(new Date(blog.createAt), 'yyyy年m月d日 hh:MM')}`
        } else {
            timeContent = `创建于${timeFormat(new Date(blog.createAt), 'yyyy年m月d日 hh:MM')}，修改于${timeFormat(new Date(blog.editAt), 'yyyy年m月d日 hh:MM')}`
        }
        return loading || !blog
            ? <div>loading...</div>
            : <div>
                <article className="blog-container">
                    <div className="blog-title">{blog.title}</div>
                    <div className="blog-time">{timeContent}</div>
                    <div
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: blog.content || '' }}
                        ref={el => {
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
                        }}
                    ></div>
                    <div className="blog-tags">
                        {blog.tags.map(t => <Link to={`/tag/${t}`} className="blog-tag" key={t}>{t}</Link>)}
                    </div>
                </article>
            </div>
    }
}