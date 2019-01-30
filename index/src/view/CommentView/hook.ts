import { Observable, combineLatest } from "rxjs";
import Context from "../../model/store";
import { useContext } from "react";
import { useObservable } from "../../precast/magic";
import { map, pluck, distinctUntilChanged, filter } from "rxjs/operators";
import { Comment } from '../../model/types';
import { usersFromState } from "../../precast/operators";

export const useCommentAuthor = (comment$: Observable<Comment>) => {
    const { state$ } = useContext(Context);
    return useObservable(() => {
        const uid$ = comment$.pipe(
            filter(c => !!c),
            pluck<Comment, string>('user')
        );
        return combineLatest(state$.pipe(usersFromState()), uid$).pipe(
            map(([users, uid]) => users.find(u => u.id === uid)),
            distinctUntilChanged()
        );
    }, null);

};