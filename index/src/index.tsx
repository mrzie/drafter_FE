import * as React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Switch, Route, Redirect, Link } from 'react-router-dom'
import { match as Match } from 'react-router'
import { History } from 'history'
import { State, Tag, Blog, Basic, List } from './models'
import get from './get'
import BlogView from './BlogView'
import ListView from './ListView'

const Header = () => <header className="header">
    <div className="container">
        <Link to="/" className="header-title">{__basic.sitename}</Link>
        <div className="header-intro">{__basic.intro}</div>
    </div>
</header>

const exclude: <T>(arr: T[], item: T) => T[] = (arr, item) => {
    const i = arr.indexOf(item)
    if (i > -1) {
        arr = [...arr]
        arr.splice(i, 1)
    }

    return arr
}

const excludeFunc: <T>(arr: T[], matcher: (t: T) => boolean) => T[] = (arr, matcher) => {
    const i = arr.findIndex(matcher)
    if (i > -1) {
        arr = [...arr]
        arr.splice(i, 1)
    }

    return arr
}

const generateAbstract = (b: Blog) => {
    const div = document.createElement('div')
    div.innerHTML = b.content
    let text = div.innerText,
        lines = text.split('\n'),
        overflow = lines.length > 12,
        abstract: string

    text = lines.slice(0, 12).join('\n')
    if (!overflow && text.length > 300) {
        overflow = true
    }

    div.innerText = text.slice(0, 300)
    abstract = div.innerHTML
    if (overflow) {
        abstract += '…'
    }
    return abstract
}

const handle = (pms => pms.then(
    data => [data, null, true],
    err => [null, err, false]
)) as { <T>(pms: Promise<T>): Promise<[T, any, boolean]> }

interface ListResponse {
    tag?: Tag,
    blogs: Blog[],
    count: number,
}

const upsertBlogCache = (cache: Blog[], update: Blog[], syncAt: number) => [
    ...cache.filter(b => !update.find(t => t.id == b.id)),
    ...update.map(b => ({ ...b, syncAt }))
]

const upsertItem: <T>(cache: T[], match: (item: T) => boolean, item: T) => T[] = (cache, matcher, item) => {
    if (cache.find(matcher)) {
        cache = cache.filter(i => !matcher(i))
    }
    return [...cache, item]
}

declare let __conf: State
declare let __basic: Basic
if (__conf) {
    const now = +new Date()
    __conf.lists && __conf.lists.forEach(l => l.syncAt = now)
    __conf.blogs && __conf.blogs.forEach(b => {
        b.syncAt = now
        b.abstract = generateAbstract(b)
    })
}

if (!__basic) {
    __basic = {
        sitename: `mrzie's blog`,
        domain: 'domain',
        intro: 'welcome to my website',
    }
}

class Main extends React.Component<null, State> {
    state: State = {
        lists: [],
        blogs: [],
        loadings: [],
        tags: [],
        // tagsSyncAt: 0,
        ...__conf || {},
    }

    fetchList = async (tag: string, p: number) => {
        const loading_key = `list.${tag}.${p}`

        if (this.state.loadings.indexOf(loading_key) > -1) {
            console.log('出错！')
            return
        }

        const showTag = tag && this.state.tags.findIndex(t => t.name == tag) == -1 || undefined

        this.setState({ loadings: [...this.state.loadings, loading_key] })
        const [result, err, ok] = await handle<ListResponse>(get('/v1/blogs', { tag, p, showTag }))

        if (ok) {
            // 当获取无效tag时，返回的tag.name和请求tagname不一致
            if (showTag && tag != result.tag.name) {
                console.warn('请求的tag不存在')
                this.setState({ loadings: exclude(this.state.loadings, loading_key) })

                return Promise.reject(1)
            }
            const syncAt = +new Date(),
                matchid = this.state.lists.findIndex(l => l.query == tag)

            let lists = [...this.state.lists],
                list: List
            if (matchid > -1) {
                list = { ...lists.splice(matchid, 1)[0], syncAt }
                list.blogs = [...list.blogs]
                list.blogs[p] = result.blogs.map(b => b.id)
                // if (list.count != result.count) {
                // 这里有问题，可能是在翻页的同时，作者增删了新的内容。导致页面内容出错
                // 而产生的问题，可能导致滑到最后一页的时候无限加载
                // 后期应该给用户一个提示，目前暂时把最大页数改过来，避免崩掉
                list.count = result.count
                // }
            } else {
                if (p != 1) {
                    console.warn('出错')
                    return
                }
                list = { query: tag, blogs: [result.blogs.map(b => b.id)], syncAt, count: result.count }
            }
            this.setState({
                lists: [...lists, list],
                blogs: upsertBlogCache(
                    this.state.blogs,
                    result.blogs.map(b => ({ ...b, abstract: generateAbstract(b) })),
                    syncAt
                ),
            })
            if (showTag) {
                this.setState({
                    tags: upsertItem(
                        this.state.tags,
                        t => t.name == result.tag.name,
                        result.tag
                    ),
                    // tagsSyncAt: syncAt,
                })
            }
            this.setState({ loadings: exclude(this.state.loadings, loading_key) })

        } else {
            this.setState({ loadings: exclude(this.state.loadings, loading_key) })

            return Promise.reject(err)
        }
    }


    fetchBlog = async (id: string) => {
        const loading_key = `blog.${id}`

        if (this.state.loadings.indexOf(loading_key) > -1) {
            console.warn('出错！');
            return
        }
        this.setState({ loadings: [...this.state.loadings, loading_key] })

        const [blog, err, ok] = await handle<Blog>(get(`/v1/blog/${id}`))

        if (ok) {
            this.setState({
                blogs: upsertItem(
                    this.state.blogs,
                    b => b.id === blog.id,
                    { ...blog, abstract: generateAbstract(blog) }
                )
            })
            this.setState({ loadings: exclude(this.state.loadings, loading_key) })

        } else {
            this.setState({ loadings: exclude(this.state.loadings, loading_key) })

            return Promise.reject(err)
        }
    }

    render() {
        return <BrowserRouter>
            <div>
                <Header />
                <div className="container">
                    <Switch>
                        <Route
                            path="/"
                            exact
                            render={({ match, history }: { match: Match<{ tag: string }>, history: History }) => {
                                const

                                    list = this.state.lists.find(l => l.query == '')

                                let
                                    nextPage: number,
                                    blogs: Blog[] = null
                                if (!list) {
                                    nextPage = 1
                                } else {
                                    const ids: string[] = [].concat(...list.blogs)
                                    blogs = this.state.blogs.filter(b => ids.indexOf(b.id) > -1)

                                    if (ids.length >= list.count) {
                                        // 到达最后一页
                                        nextPage = null
                                    } else {
                                        nextPage = list.blogs.length + 1
                                    }
                                }

                                return <ListView
                                    tagname=""
                                    fetchList={this.fetchList}
                                    history={history}
                                    loading={this.state.loadings.indexOf(`list..${nextPage}`) > -1}
                                    nextPage={nextPage}
                                    tag={null}
                                    blogs={blogs}
                                />
                            }}
                        />
                        <Route
                            path="/tag/:tag"
                            render={({ match, history }: { match: Match<{ tag: string }>, history: History }) => {
                                const
                                    tagname = match.params.tag,
                                    list = this.state.lists.find(l => l.query == tagname)

                                let
                                    nextPage: number,
                                    blogs: Blog[] = null
                                if (!list) {
                                    nextPage = 1
                                } else {
                                    const ids: string[] = [].concat(...list.blogs)
                                    blogs = this.state.blogs.filter(b => ids.indexOf(b.id) > -1)

                                    if (ids.length >= list.count) {
                                        // 到达最后一页
                                        nextPage = null
                                    } else {
                                        nextPage = list.blogs.length + 1
                                    }
                                }

                                return <ListView
                                    tagname={tagname}
                                    fetchList={this.fetchList}
                                    history={history}
                                    loading={this.state.loadings.indexOf(`list.${tagname}.${nextPage}`) > -1}
                                    nextPage={nextPage}
                                    tag={this.state.tags.find(item => item.name == tagname)}
                                    blogs={blogs}
                                />
                            }}
                        />
                        <Route
                            path="/blog/:id"
                            component={({ match, history }: { match: Match<{ id: string }>, history: History }) => {
                                const id = match.params.id
                                console.log('loading', id, this.state)
                                return <BlogView
                                    blogs={this.state.blogs}
                                    loading={this.state.loadings.indexOf(`blog.${id}`) > -1}
                                    fetchBlog={this.fetchBlog}
                                    id={id}
                                    history={history}
                                />
                            }}
                        />
                        <Route
                            path="/error"
                            component={() => <div> not found</div>}
                            ref={() => document.title=`出错啦！ - ${__basic.sitename}`}
                        />
                        <Route
                            component={() => <Redirect to="/error" />}
                        />
                    </Switch>
                </div>
                <footer className="footer">
                    <div className="container">
                        Copyright © 2014-2018  Mr.ZiE | All Rights Reserved.<br />
                        mrzie@outlook.com&nbsp;
                    </div>
                </footer>
            </div>
        </BrowserRouter>
    }
}

render(
    <Main />,
    document.getElementById('app')
);