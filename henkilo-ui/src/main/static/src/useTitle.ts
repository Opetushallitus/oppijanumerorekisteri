import { useEffect } from 'react';

export function useTitle(title?: string) {
    useEffect(() => {
        const prevTitle = document.title;
        if (title) {
            document.title = title;
        }
        return () => {
            document.title = prevTitle;
        };
    });
}
