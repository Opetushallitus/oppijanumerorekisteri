import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';

import OphTable, { OphTableProps } from './OphTable';

type Props<T> = {
    fetch: () => void;
    isActive: boolean;
} & OphTableProps<T>;

export const OphTableWithInfiniteScroll = <T,>({ fetch, isActive, table, isLoading, renderSubComponent }: Props<T>) => {
    return (
        <>
            <OphTable table={table} isLoading={isLoading} renderSubComponent={renderSubComponent} />
            <VisibilitySensor
                onChange={(isVisible) => isVisible && fetch()}
                active={isActive}
                resizeDelay={500}
                delayedCall
                partialVisibility
            >
                <div style={{ visibility: 'hidden' }}>invisible</div>
            </VisibilitySensor>
        </>
    );
};
