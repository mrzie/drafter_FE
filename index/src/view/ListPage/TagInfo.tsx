import * as React from 'react';
import { memo } from "react";
import {useStore} from "../../model/store";
import { useRouteContext } from "../../precast/page";
import { useObservable } from "fugo";
import { map } from "rxjs/operators";
import { tagsFromState } from "../../model/operators";
import { combineLatest } from "rxjs";
import { parse as _marked } from 'marked';

const TagInfo = () => {
    const { params$ } = useRouteContext<{ tag: string }>();
    const { state$ } = useStore();

    const tag = useObservable(() => combineLatest(params$, tagsFromState(state$)).pipe(
        map(([params, tags]) => tags.find(tag => tag.name === params.tag))
    ), null);


    if (!tag) {
        return null;
    }
    return <div className="tag-info">
        <div className="tag-title">{tag.name}</div>
        <div className="tag-count">共{tag.count}篇文章。</div>
        <div
            className="tag-description"
            dangerouslySetInnerHTML={{
                __html: _marked(tag.description, { breaks: true }) || ''
            }}
        />
    </div>;
}

export default memo(TagInfo);

