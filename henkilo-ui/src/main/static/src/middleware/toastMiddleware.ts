import { createListenerMiddleware } from '@reduxjs/toolkit';

import { add, remove } from '../slices/toastSlice';
import { ToastProps } from '../components/design-system/OphDsToast';

const listenerMiddleware = createListenerMiddleware();

const getDelayMs = (toast: ToastProps) => {
    const wordCount = toast.header?.split(' ').length ?? 0 + (toast.body?.split(' ').length ?? 0);
    const wordLengthDelay = Math.round((wordCount / 150) * 60 * 1000);
    return 5000 + wordLengthDelay;
};

listenerMiddleware.startListening({
    actionCreator: add,
    effect: async (action, listenerApi) => {
        const forkDelay = listenerApi.fork(async (forkApi) => {
            const delay = getDelayMs(action.payload);
            await forkApi.delay(delay);
        });

        await forkDelay.result;
        listenerApi.dispatch(remove(action.payload.id));
    },
});

export default listenerMiddleware.middleware;
