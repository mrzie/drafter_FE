import { Observable, Subject } from "rxjs";
import { useObservable } from "./magic";
import { useEffect, useMemo } from "react";

export interface ComponentMain<D extends Drivers> {
    (source: EffectSinks<D>): EffectSource<D> & { value: Observable<any> },
}

export type EffectSinks<D extends Drivers> = {
    [P in keyof D]: ReturnType<D[P]>;
} & { value: never }

type EffectType<
    Fn extends (value: Observable<any>) => any
    > = Fn extends (value: Observable<infer T>) => any ? T : any;

type EffectSource<D extends Drivers> = {
    [P in keyof Partial<D>]: Observable<EffectType<D[P]>>
};

interface Drivers {
    [name: string]: (value: Observable<any>) => any,
    value?: (value: Observable<any>) => void,
}

type StateType<Main extends ComponentMain<any>> = ReturnType<Main>['value'] extends Observable<infer T> ? T : null

export const useRx = <
    D extends Drivers,
    Main extends ComponentMain<D>,
    >(
        effectsFactory: () => D,
        main: Main,
        init: StateType<Main> = null
    ) => {
    const [sinks, cleanUp] = useMemo(() => {
        const effects = effectsFactory();

        const { source, subjects } = Object.keys(effects).reduce(
            (cur, key) => {
                const { source, subjects } = cur;
                const subject = new Subject<any>();
                source[key] = effects[key](subject);
                subjects[key] = subject;
                return cur;
            },
            {
                source: {} as EffectSinks<D>,
                subjects: {} as { [P in keyof Partial<D>]: Subject<EffectType<D[P]>> }
            }
        );

        const sinks = main(source);
        Object.entries(sinks).forEach(([key, source]) => {
            if (!subjects[key]) {
                return;
            }
            source.subscribe(subjects[key]);
        });
        return [
            sinks,
            () => {
                Object.values(subjects).forEach(subject => {
                    subject.complete();
                });
            }
        ] as [ReturnType<Main>, () => void];
    }, []);

    useEffect(() => cleanUp, []);

    const state = useObservable<StateType<Main>>(() => sinks.value, init);

    return state;
};