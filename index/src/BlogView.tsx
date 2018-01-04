import * as React from 'react'
import { match as Match } from 'react-router'
import { Link } from 'react-router-dom'
import { History } from 'history'
import { timeFormat } from './utils'
import { Blog } from './models'

interface BlogViewProps {
    id: string,
    history: History,
    loading: boolean,
    blogs: Blog[],
    fetchBlog: (id: string) => Promise<any>,
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
            return props.fetchBlog(id)
        }

        // 好，这里拿到文章了
        if (this.props == props || this.props.id != props.id) {
            window.scrollTo(0, 0)
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
                    <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content || '' }} ></div>
                    <div className="blog-tags">
                        {blog.tags.map(t => <Link to={`/tag/${t}`} className="blog-tag" key={t}>{t}</Link>)}
                    </div>
                </article>
            </div>
    }
}