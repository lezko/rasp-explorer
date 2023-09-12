import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import scheduleParamsReducer from 'store/scheduleParamsSlice';
import scheduleReducer from 'store/scheduleSlice';

export const store = configureStore({
    reducer: {
        scheduleParams: scheduleParamsReducer,
        schedule: scheduleReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;