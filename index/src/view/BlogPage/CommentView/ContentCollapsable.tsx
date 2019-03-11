import * as React from 'react';
import { memo, useMemo } from "react";
import { withLatestFrom, map, distinctUntilChanged, scan, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { useObservable, useEventHandler, useObservableFrom } from 'fugo';

interface ContentCollapsableProps {
    content: string,
}

const _short_quote_content = (content: string) => content.slice(0, 200).split('\n').slice(0, 4).join('\n');

const ContentCollapsable = ({ content }: ContentCollapsableProps) => {
    const content$ = useObservableFrom(content);
    const [toggleCollapsed, toggle$] = useEventHandler<React.MouseEvent>();

    const { collapsable$, collapsed$, text$ } = useMemo(() => {
        const collapsable$ = content$.pipe(
            map(content => content !== _short_quote_content(content)),
            distinctUntilChanged()
        );

        const collapsed$ = toggle$.pipe(
            scan<React.MouseEvent, boolean>(acc => !acc, true),
            startWith(true),
            withLatestFrom(collapsable$),
            map(([source, able]) => able && source)
        );

        const text$ = combineLatest(content$, collapsed$).pipe(
            map(([content, collapsed]) => collapsed ? _short_quote_content(content) : content)
        );

        return { collapsable$, collapsed$, text$ };
    }, []);

    const text = useObservable(() => text$, content);
    const collapsable = useObservable(() => collapsable$, false);
    const collapsed = useObservable(() => collapsed$, false);


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
};

export default memo(ContentCollapsable);