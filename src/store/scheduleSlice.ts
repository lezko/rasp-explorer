import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchSpreadSheet} from 'store/scheduleActionCreators';
import {ParsingResult} from 'core/ScheduleParser';
import {useAppSelector} from 'store/index';

export interface ScheduleState {
    studyGroups: ParsingResult;
    loading: boolean;
    error: string;
}

const initialState: ScheduleState = {
    studyGroups: {},
    loading: false,
    error: ''
};

export const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        setSchedule(state, action: PayloadAction<ParsingResult>) {
            state.studyGroups = action.payload;
        },
    },
    extraReducers: {
        [fetchSpreadSheet.fulfilled.type]: (state, action: PayloadAction<ParsingResult>) => {
            state.studyGroups = action.payload;
            state.loading = false;
            state.error = '';
        },
        [fetchSpreadSheet.pending.type]: (state) => {
            state.loading = true;
        },
        [fetchSpreadSheet.rejected.type]: (state, action: PayloadAction<string>) => {
            state.studyGroups = {};
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {setSchedule} = scheduleSlice.actions;
export default scheduleSlice.reducer;

export function useSchedule(): ScheduleState {
    return useAppSelector(state => state.schedule);
}