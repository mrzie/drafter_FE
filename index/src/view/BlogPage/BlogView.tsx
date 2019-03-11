import * as React from 'react';
import { useContext, useRef, useMemo, memo } from 'react';
import BlogContext from './BlogContext';
import { useObservable, useListener, useWhenLayout } from 'fugo';
import { throttle, pluck, filter, withLatestFrom } from 'rxjs/operators';
import { Blog } from '../../../src/model/types';
import { Link } from 'react-router-dom';
import { timeFormat } from '../../precast/pure';

declare let PR: {
    prettyPrint: () => void
}

const BlogView = () => {
    const { id$, blog$, isLoading$ } = useContext(BlogContext);
    const refContent = useRef(null as HTMLDivElement);

    const refContent$ = useWhenLayout(() => refContent.current);

    const blog = useObservable(() => blog$, null);
    const isLoading = useObservable(() => isLoading$, true);

    // pretty print
    useListener(() => refContent$.pipe(
        throttle(() => blog$.pipe(pluck<Blog, string>('content'))),
        withLatestFrom(blog$, isLoading$),
        filter(([el, blog, isLoading]) => {
            if (isLoading) {
                return false;
            }
            if (!blog) {
                return false;
            }
            if (!el) {
                return false;
            }
            return true;
        })
    ).subscribe(([el]) => {
        const codeBoxes = Array
            .from(el.querySelectorAll('pre'))
            .filter(pre => {
                const { firstElementChild: child } = pre;
                return child && child.nodeName === 'CODE' && child.className;
            });
        codeBoxes.forEach(pre => pre.classList.add('prettyprint'));
        try {
            if (PR) {
                PR.prettyPrint();
                codeBoxes.forEach(pre => {
                    const nums = document.createElement('div');
                    nums.classList.add('linenums-wrapper');
                    nums.innerText = pre.querySelector('code')
                        .innerText
                        .split('\n')
                        .map((_, index) => index + 1 + '.')
                        .join('\n');
                    pre.insertBefore(nums, pre.firstChild);
                });
            }
        } catch (e) { }
    }));

    const contentView = useMemo(() => <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog && blog.content || '' }}
        ref={refContent}
    />, [blog && blog.content]);


    if (isLoading || !blog) {
        return <div>loading...</div>;
    }

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

export default memo(BlogView);