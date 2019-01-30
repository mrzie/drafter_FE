import { Subject, Observable } from 'rxjs';
import { useMemo, useEffect, useRef } from 'react';
import { useBehaviorSubject } from './magic';

export const useSubject = <T>() => {
    const subject = useMemo(() => new Subject<T>(), []);
    useEffect(() => () => subject.complete(), []);
    return subject;
}
