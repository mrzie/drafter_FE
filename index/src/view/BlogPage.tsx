import * as React from 'react';
import { memo, useMemo } from 'react';
import Page from '../precast/page';
import blogViewController, { blogPageController } from './blogPageController';
import { BlogCompProps } from './types';
import { timeFormat } from '../precast/pure';
import { Link } from 'react-router-dom';
import CommentView from './CommentView';

export const BlogPage = Page<{ id: string }>(memo(props => {
    const [id$, blog$, history$] = blogPageController(props);

    return <div>
        <BlogView id$={id$} blog$={blog$} history$={history$} />
        <CommentView id$={id$} blog$={blog$} />
    </div>
}));

const BlogView = (props: BlogCompProps) => {
    const [isLoading, blog, contentAnchor] = blogViewController(props);

    if (isLoading || !blog) {
        return <div>loading...</div>;
    }

    const contentView = useMemo(() => <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content || '' }}
        ref={contentAnchor}
    ></div>, [blog.content]);

    return <article className="blog-container">
        <div className="blog-title">{blog.title}</div>
        {
            blog.createAt === blog.editAt
                ? <div className="blog-time">创建于{timeFormat(new Date(blog.createAt), 'yyyy年m月d日 hh:MM')}</div>
                : <div className="blog-time">创建于{timeFormat(new Date(blog.createAt), 'yyyy年m月d日 hh:MM')}，修改于{timeFormat(new Date(blog.editAt), 'yyyy年m月d日 hh:MM')}</div>
        }
        {contentView}
        <div className="blog-tags">
            {blog.tags.map(t => <Link to={`/tag/${t}`} className="blog-tag" key={t}>{t}</Link>)}
        </div>
    </article>;
};

export default BlogPage;