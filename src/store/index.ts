import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import scheduleReducer from 'store/scheduleSlice';
import settingsReducer from 'store/settingsSlice';

export const store = configureStore({
    reducer: {
        schedule: scheduleReducer,
        settings: settingsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
