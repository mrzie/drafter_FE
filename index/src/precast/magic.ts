import { useState, useMemo, useEffect, useLayoutEffect, useCallback } from "react";
import { Observable, BehaviorSubject, Subject, Subscription, of, concat } from "rxjs";
import { withLatestFrom, map, debounce, distinctUntilChanged, skipUntil, take } from "rxjs/operators";
import { animationFrame } from "rxjs/internal/scheduler/animationFrame";

export const useObservable = <T>(maker: () => Observable<T>, initValue: T) => {
    let value: T, setValue: React.Dispatch<React.SetStateAction<T>>;
    const [initialState, subscription] = useMemo(() => {
        let initialState = initValue;
        const source = maker();
        let setter = (v: T) => {
            if (!setValue) {
                initialState = v;
            } else {
                setValue(v);
                setter = setValue;
            }
        };
        const subscription = source.subscribe(v => setter(v));

        return [initialState, subscription] as [T, Subscription];
    }, []);
    [value, setValue] = useState(initialState);

    useEffect(() => () => subscription.unsubscribe(), []);

    return value;
};

export const useEventHandler = <Event>(
    handler?: (ob: Observable<Event>) => Subscription
) => {
    const subject = useMemo(() =>  {
        const subject = new Subject<Event>();
        if (handler) {
            handler(subject);
        }
        return subject;
    }, []);
    const callback = useCallback((e: Event) => subject.next(e), []);
    useEffect(() => () => subject.complete());
    return [callback, subject] as [typeof callback, Subject<Event>]
};

export const useBehaviorSubject = <T>(initValue: T) => {
    const subject = useMemo(() => new BehaviorSubject(initValue), []);

    useEffect(() => () => subject.complete(), []);
    return subject;
};

export const useSubjectState = <T>(initValue: T) => {
    const subject = useBehaviorSubject(initValue);
    const value = useObservable(() => subject, initValue);
    return [value, subject] as [T, BehaviorSubject<T>];
};

export const useObservableFrom = <T>(inputs: T) => {
    const subject$ = useBehaviorSubject(inputs);
    useMemo(() => subject$.next(inputs), [inputs]);
    return useMemo(() => subject$.asObservable(), []);
};

export const useLayoutObservable = () => {
    const subject$ = useMemo(() => new Subject<0>(), []);
    useLayoutEffect(() => subject$.next(0));
    useEffect(() => () => subject$.complete(), []);
    return subject$;
};

export type SubjectSubscriber<T> = (source: Observable<T>) => Subscription | Subscription[];
export type UseSubject = <T>(handler: SubjectSubscriber<T>) => Subject<T>;
export type DeferCleanup = (handler: () => void) => void;

export const useDefinition = <T>(definer: (useSubject: UseSubject, defer: DeferCleanup) => T) => {
    const memorized = useMemo(() => {
        const temporarySubjects = [] as Subject<any>[];
        const defers = [] as Function[];

        const defer: DeferCleanup = fn => {
            defers.push(fn);
        };
        const useSubject: UseSubject = <T>(handler: SubjectSubscriber<T>) => {
            const subject = new Subject<T>();
            handler(subject);
            temporarySubjects.push(subject);
            return subject;
        };
        const result = definer(useSubject, defer);

        defer(() => {
            temporarySubjects.forEach(subject => subject.complete());
        });

        return [result, defers] as [T, Function[]];
    }, []);
    useEffect(() => () => {
        const [, defers] = memorized;
        defers.forEach(fn => fn());
    }, []);
    return memorized[0];
};

export const useDebouncedState = <T>(state: T) => {
    const state$ = useBehaviorSubject(state);
    return useDefinition((useSubject, deferCleanup) => {
        const mutation$ = useSubject<Partial<T>>(source => source.pipe(
            withLatestFrom(state$),
            map(([mutation, state]) => ({ ...state, ...mutation }))
        ).subscribe(state$));

        return [
            concat(
                state$.pipe(take(1)),
                state$.pipe(
                    debounce(() => of(animationFrame))
                )
            ).pipe(distinctUntilChanged()),
            mutation$,
        ] as [Observable<T>, Subject<Partial<T>>];
    });
};