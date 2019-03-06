import { Observable, combineLatest } from "rxjs";
import { State, Comment } from "../../../../src/model/types";
import { useObservable } from "../../../precast/magic";
import { filter, pluck,  map, distinctUntilChanged } from "rxjs/operators";
import { usersFromState } from "../../../model/operators";

const useAuthorFrom = (state$: Observable<State>, comment$: Observable<Comment>) => {
    return useObservable(() => {
        const uid$ = comment$.pipe(
            filter(c => !!c),
            pluck<Comment, string>('user')
        );
        return combineLatest(state$.pipe(usersFromState), uid$).pipe(
            map(([users, uid]) => users.find(u => u.id === uid)),
            distinctUntilChanged()
        );
    }, null);
};

export default useAuthorFrom;