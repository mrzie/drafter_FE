import * as React from 'react';
import { memo } from 'react';
import { Observable } from "rxjs";
import { useObservable } from "fugo";

interface LoadIndicatorProps {
    nextPage$: Observable<number>,
    isLoading$: Observable<boolean>,
    refMore: React.MutableRefObject<HTMLDivElement>,
}

const LoadIndicator = ({ nextPage$, isLoading$, refMore }: LoadIndicatorProps) => {
    const nextPage = useObservable(() => nextPage$, null);
    const isLoading = useObservable(() => isLoading$, true);

    if (isLoading) {
        return <div className="load-more">loading...</div>;
    } else if (nextPage) {
        return <div ref={refMore} className="load-more">查看更多</div>
    } else {
        return <div className="load-more">后面没有啦</div>;
    }
};

export default memo(LoadIndicator);