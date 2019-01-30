import * as React from 'react';
import { memo } from "react";
import { useEventHandler, useObservableFrom, useObservable, useBehaviorSubject } from '../../precast/magic';
import { withLatestFrom, map, distinctUntilChanged } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

interface ContentCollapsableProps {
    content: string,
}

const _short_quote_content = (content: string) => content.slice(0, 200).split('\n').slice(0, 4).join('\n');
const contentCollapsableController = ({ content }: ContentCollapsableProps) => {
    const
        collapsed$ = useBehaviorSubject(false),
        collapsed = useObservable(() => collapsed$, false),
        [toggleCollapsed] = useEventHandler<React.MouseEvent>($ => $.pipe(
            withLatestFrom(collapsed$),
            map(([, collapsed]) => !collapsed)
        ).subscribe(collapsed$)),
        content$ = useObservableFrom(content),
        collapsable = useObservable(() => content$.pipe(
            map(content => _short_quote_content(content) !== content),
            distinctUntilChanged()
        ), false),
        text = useObservable(() => combineLatest(content$, collapsed$).pipe(
            map(([content, collapsed]) => {
                if (collapsed) {
                    return _short_quote_content(content);
                }
                return content;
            })
        ), content);

    return [
        text,
        collapsable,
        collapsed,
        toggleCollapsed,
    ] as [string, boolean, boolean, typeof toggleCollapsed]
}

const ContentCollapsable = memo((props: ContentCollapsableProps) => {
    const [text, collapsable, collapsed, toggleCollapsed] = contentCollapsableController(props);

    return <div className="comment-ref-body">
        {text}
        {
            collapsable && <span
                className="comment-ref-collapse"
                onClick={toggleCollapsed}
            >
                {collapsed ? '展开' : '收起'}
            </span>
        }
    </div>;
});

export default ContentCollapsable;