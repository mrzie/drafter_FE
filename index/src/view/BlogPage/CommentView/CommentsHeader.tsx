import * as React from 'react';
import { useContext, memo } from "react";
import CommentsContext from "./CommentsContext";
import { useObservable } from "../../../precast/magic";
import { filter, map } from "rxjs/operators";

const CommentsHeader = () => {
    const { comments$ } = useContext(CommentsContext);
    const commentsCount = useObservable(() => comments$.pipe(
        filter(comments => !!comments),
        map(comments => comments.length)
    ), 0);

    return <div className="comments-title">留言（{commentsCount}）</div>;
};

export default memo(CommentsHeader);