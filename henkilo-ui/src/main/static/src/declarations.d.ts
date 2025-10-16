export {};

import R from 'react';

declare global {
    // fix for react-visibility-sensor types
    namespace React {
        type StatelessComponent<P> = R.FunctionComponent<P>;
    }
}
