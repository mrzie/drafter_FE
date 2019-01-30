import * as React from 'react';
import { memo } from 'react';
import Page from '../precast/page';
import { Link } from 'react-router-dom';
import { timeFormat } from '../precast/pure';
import { parse as _marked } from 'marked';
import listPageController from './listPageController';

export const ListPage = Page(memo(props => {
    const [blogs, tag, anchorMore, isLoading, nextPage] = listPageController(props);

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
                    const { id, title, createAt, abstract, tags } = blog;
                    return < article className="list-blog" key={id}>
                        <Link className="list-blog-title" to={`/blog/${id}`}>{title}</Link>
                        <div className="list-blog-time">{timeFormat(new Date(createAt), 'yyyy年m月d日 hh:MM')}</div>
                        <div className="list-blog-content">
                            <div
                                className="list-blog-abstract"
                                dangerouslySetInnerHTML={{ __html: abstract || '' }}
                            />
                            <Link className="list-blog-readmore cyan-link" to={`/blog/${id}`}>阅读全文</Link>
                        </div>
                        <div className="list-blog-tags">
                            {tags.map(t => <Link to={`/tag/${t}`} className="list-blog-tag" key={t}>{t}</Link>)}
                        </div>
                    </article>
                }) : null
            }
        </div>
        {
            isLoading
                ? <div className="load-more">loading...</div>
                : nextPage
                    ? <div ref={anchorMore} className="load-more">查看更多</div>
                    : <div className="load-more">后面没有啦</div>
        }
    </div>
}));

export default ListPage;