import * as React from 'react';
import { useRef, useMemo } from 'react';
import Page, { useRouteContext } from '../../precast/page';
import { parse as _marked } from 'marked';
import { useListener } from 'fugo';
import { combineLatest, fromEvent, merge } from 'rxjs';
import { __basic } from '../../model/conf';
import { withLatestFrom, map, distinctUntilChanged, filter, pairwise } from 'rxjs/operators';
import { listsFromState, loadStackFromState, tagsFromState, blogsFromState } from '../../model/operators';
import { KEYOF_FETCH_LIST } from '../../model/keyExtractor';
import LoadIndicator from './LoadIndicator';
import BlogList from './BlogList';
import { useStore } from '../../model/store';
import TagInfo from './TagInfo';

const listPageModel = () => {
    const refMore = useRef(null as HTMLDivElement);
    const { state$, actions } = useStore();
    const { history$, params$ } = useRouteContext<{ tag: string }>();

    const { tagname$, list$, nextPage$, isLoading$ } = useMemo(() => {
        const tagname$ = params$.pipe(map(params => params.tag || ''));
        const list$ = combineLatest(listsFromState(state$), tagname$).pipe(
            map(([lists, tagname]) => lists.find(list => list.query === tagname))
        );
        const nextPage$ = list$.pipe(
            map(list => {
                if (!list) {
                    return 1;
                }
                if (list.blogs.length >= list.count) {
                    return null;
                }
                return list.blogs.length + 1;
            }),
            distinctUntilChanged()
        );
        const isLoading$ = combineLatest(
            loadStackFromState(state$),
            tagname$,
            nextPage$
        ).pipe(
            map(([keys, tagname, nextPage]) => keys.includes(KEYOF_FETCH_LIST(tagname, nextPage))),
            distinctUntilChanged()
        );

        return { tagname$, list$, nextPage$, isLoading$ }
    }, []);

    // set title
    useListener(() => tagname$.subscribe(tagname => {
        if (tagname) {
            document.title = `『${tagname}』 - ${__basic.sitename}`;
        } else {
            document.title = __basic.sitename;
        }
    }));

    // empty handler
    useListener(() => isLoading$.pipe(
        withLatestFrom(tagname$, list$),
        pairwise(),
        filter(([[, prevTagname], [isLoading, tagname, list]]) => {
            if (isLoading) {
                return false;
            }
            if (list) {
                return false;
            }
            return tagname === prevTagname;
        }),
        withLatestFrom(history$)
    ).subscribe(([, history]) => history.push('/error')));

    // fetch list 
    useListener(() => {
        const freshRoute$ = tagname$.pipe(
            withLatestFrom(list$, isLoading$),
            filter(([, list, isLoading]) => !isLoading && !list),
            map(([tagname]) => [tagname, 1] as [string, number])
        );

        const validScroll$ = fromEvent<UIEvent>(document, 'scroll').pipe(
            map(() => refMore.current),
            withLatestFrom(isLoading$, nextPage$, tagname$),
            filter(([elMore, isLoading, nextPage]) => {
                if (isLoading) {
                    return false;
                }
                if (nextPage === null) {
                    return false;
                }
                if (!elMore) {
                    return false;
                }
                const { offsetTop, clientHeight } = elMore;

                const wholeDivAppear = offsetTop + clientHeight <= window.scrollY + window.innerHeight;
                return wholeDivAppear;
            }),
            map(([, , page, tagname]) => [tagname, page] as [string, number])
        );

        return merge(freshRoute$, validScroll$).subscribe(([tagname, page]) => {
            actions.fetchList(tagname, page);
        });
    });

    return { isLoading$, list$, nextPage$, refMore };
};


const ListPage = () => {
    const { isLoading$, list$, nextPage$, refMore } = listPageModel();

    return <div className="list-wrapper">
        <TagInfo />
        <BlogList list$={list$} />
        <LoadIndicator nextPage$={nextPage$} isLoading$={isLoading$} refMore={refMore} />
    </div>
};

export default Page(ListPage);