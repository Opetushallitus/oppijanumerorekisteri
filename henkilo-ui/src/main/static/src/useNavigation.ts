import { useEffect } from 'react';
import { NaviTab } from './types/navigation.type';
import { useAppDispatch } from './store';
import { clearNavigation, setNavigation } from './slices/navigationSlice';

export function useNavigation(tabs: NaviTab[], backButton: boolean) {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(setNavigation({ tabs, backButton }));
        return () => {
            dispatch(clearNavigation());
        };
    });
}
