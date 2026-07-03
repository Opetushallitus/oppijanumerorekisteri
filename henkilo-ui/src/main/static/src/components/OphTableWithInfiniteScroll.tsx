import React, { useEffect, useRef } from 'react';

import OphTable, { OphTableProps } from './OphTable';

type Props<T> = {
    fetch: () => void;
    isActive: boolean;
} & OphTableProps<T>;

export const OphTableWithInfiniteScroll = <T,>({ fetch, isActive, table, isLoading, renderSubComponent }: Props<T>) => {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive) {
            return;
        }

        const sentinel = sentinelRef.current;
        if (!sentinel) {
            return;
        }

        if (!window.IntersectionObserver) {
            fetch();
            return;
        }

        let timeout: number | undefined;
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                window.clearTimeout(timeout);
                timeout = window.setTimeout(fetch, 500);
            }
        });

        observer.observe(sentinel);

        return () => {
            window.clearTimeout(timeout);
            observer.disconnect();
        };
    }, [fetch, isActive]);

    return (
        <>
            <OphTable table={table} isLoading={isLoading} renderSubComponent={renderSubComponent} />
            <div ref={sentinelRef} style={{ visibility: 'hidden' }}>
                invisible
            </div>
        </>
    );
};
