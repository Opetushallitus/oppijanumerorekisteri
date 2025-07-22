export {};

import R from 'react';

declare global {
    interface Window {
        opintopolku_caller_id?: string;
    }

    // fix for react-visibility-sensor types
    namespace React {
        type StatelessComponent<P> = R.FunctionComponent<P>;
    }
}
