import { useContext, useRef } from 'react';
import { RouteObservableProps } from '../precast/page';
import { map, withLatestFrom, filter, pairwise, distinctUntilChanged, mapTo, pluck } from 'rxjs/operators';
import Context from '../model/store'
import { useObservable, useDefinition } from '../precast/magic';
import { fromEvent, combineLatest, Observable } from 'rxjs';
import { Blog, Tag, TagName, PageNumber } from '../model/types';
import { __basic } from '../model/conf';
import { KEYOF_FETCH_LIST } from '../model/keyExtractor';
import { blogsFromState, loadStackFromState, tagsFromState, listsFromState } from '../precast/operators';

export const listPageController = ({ params$, history$ }: RouteObservableProps<{ tag: string }>) => {
    const anchorMore = useRef(null as HTMLDivElement);
    const { state$, actions } = useContext(Context);

    const [
        blogs$,
        tagname$,
        tags$,
        isLoading$,
        nextPage$,
    ] = useDefinition((useSubject, deferCleanup) => {
        const tagname$ = params$.pipe(map((params) => params.tag || ''));
        const list$ = combineLatest(
            state$.pipe(listsFromState()),
            tagname$
        ).pipe(
            map(([lists, tagname]) => lists.find(list => list.query === tagname))
        );
        const tags$ = state$.pipe(tagsFromState());
        const blogs$ = list$.pipe(
            map(list => (list ? [].concat(...list.blogs) : []) as string[]),
            withLatestFrom(state$.pipe(blogsFromState())),
            map(([ids, blogs]) => ids.map(i => blogs.find(blog => blog.id === i)).filter(blog => !!blog))
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
            state$.pipe(loadStackFromState()),
            tagname$,
            nextPage$
        ).pipe(
            map(([keys, tagname, nextPage]) => keys.includes(KEYOF_FETCH_LIST(tagname, nextPage))),
            distinctUntilChanged()
        );


        const scrollToFetch$$ = fromEvent<UIEvent>(document, 'scroll').pipe(
            map(() => anchorMore.current),
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
        ).subscribe(([, , page, tagname]) => {
            actions.fetchList(tagname, page);
        });

        const titleSettlement$$ = tagname$.subscribe(tagname => {
            if (tagname) {
                document.title = `『${tagname}』 - ${__basic.sitename}`;
            } else {
                document.title = __basic.sitename;
            }
        });

        const scrollTop$$ = tagname$.subscribe(() => {
            window.scrollTo(0, 0);
        });

        const fetchWhenRoute$$ = tagname$.pipe(
            withLatestFrom(list$, isLoading$),
            filter(([, list, isLoading]) => !isLoading && !list)
        ).subscribe(([tagname]) => {
            actions.fetchList(tagname, 1);
        });

        const routeWhenEmpty$$ = isLoading$.pipe(
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
        ).subscribe(([, history]) => history.push('/error'));

        deferCleanup(() => {
            scrollToFetch$$.unsubscribe();
            titleSettlement$$.unsubscribe();
            scrollTop$$.unsubscribe();
            fetchWhenRoute$$.unsubscribe();
            routeWhenEmpty$$.unsubscribe();
        });

        return [
            blogs$,
            tagname$,
            tags$,
            isLoading$,
            nextPage$,
        ] as [
                Observable<Blog[]>,
                Observable<TagName>,
                Observable<Tag[]>,
                Observable<boolean>,
                Observable<PageNumber>
            ];
    });


    const blogs = useObservable(() => blogs$, []);
    const tag = useObservable(
        () => combineLatest(tagname$, tags$).pipe(
            map(([tagname, tags]) => tags.find(tag => tag.name === tagname))
        ),
        null
    );
    const isLoading = useObservable(() => isLoading$, false);
    const nextPage = useObservable(() => nextPage$, null);

    return [blogs, tag, anchorMore, isLoading, nextPage] as [Blog[], Tag, typeof anchorMore, boolean, number];
};

export default listPageController;