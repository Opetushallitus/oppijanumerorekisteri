import { useEffect } from 'react';
import { NaviTab } from './types/navigation.type';
import { useAppDispatch } from './store';
import { clearNavigation, initialState, setNavigation } from './slices/navigationSlice';

export function useNavigation(tabs: NaviTab[]) {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(setNavigation({ tabs }));
        return () => {
            dispatch(clearNavigation(initialState));
        };
    });
}
