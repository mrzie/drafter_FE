import * as React from 'react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { parse as _marked } from 'marked';
import { timeFormat } from '../../precast/pure';
import { __basic } from '../../model/conf';
import { Blog, List } from '../../model/types';
import { Observable } from 'rxjs';
import { useObservable } from '../../precast/magic';
import { blogsFromState } from '../../model/operators';
import { map, withLatestFrom } from 'rxjs/operators';
import { useStore } from '../../model/store';


const AbstractView = memo(({ blog }: { blog: Blog }) => {
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
});

interface BlogListProps {
    list$: Observable<List>,
}

const BlogList = ({ list$ }: BlogListProps) => {
    const { state$ } = useStore();
    const blogs = useObservable(() => list$.pipe(
        map(list => (list ? [].concat(...list.blogs) : []) as string[]),
        withLatestFrom(state$.pipe(blogsFromState)),
        map(([ids, blogs]) => ids.map(i => blogs.find(blog => blog.id === i)).filter(blog => !!blog))
    ), []);

    return <div className="blog-list">
        {blogs.map(blog => <AbstractView key={blog.id} blog={blog} />)}
    </div>
}

export default memo(BlogList);