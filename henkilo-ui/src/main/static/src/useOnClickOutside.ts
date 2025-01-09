import { MutableRefObject, useEffect } from 'react';

export function useOnClickOutside(ref: MutableRefObject<HTMLDivElement>, action: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as HTMLDivElement)) {
                action();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, action]);
}
