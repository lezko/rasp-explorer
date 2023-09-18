import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchSpreadSheet} from 'store/scheduleActionCreators';
import {ParsingResult} from 'core/ScheduleParser';
import {useAppSelector} from 'store/index';
import {findStudyGroup, removeStudyGroupFromLocalStorage, saveStudyGroupToLocalStorage} from 'utils/scheduleUtils';

export interface ScheduleParams {
    url?: string;
    sheetIndex?: number;
    year?: number;
    groupNumber?: number;
    subgroupNumber?: number;
}

export interface ScheduleState {
    data: ParsingResult | null;
    // fixme type
    optionsTree: any;
    loading: boolean;
    error: string;
    params: ScheduleParams;
}

const initialState: ScheduleState = {
    data: null,
    optionsTree: null,
    loading: false,
    error: '',
    params: getScheduleParamsFromLocalStorage() || {}
};

export function parseScheduleParams(url: string): ScheduleParams {
    const params = new URLSearchParams(url);
    const result: ScheduleParams = {};
    result.url = params.get('url') || undefined;

    const sheetIndex = params.get('sheetIndex');
    result.sheetIndex = sheetIndex ? +sheetIndex : undefined;

    const year = params.get('year');
    result.year = year ? +year : undefined;

    const groupNumber = params.get('groupNumber');
    result.groupNumber = groupNumber ? +groupNumber : undefined;

    const subgroupNumber = params.get('subgroupNumber');
    result.subgroupNumber = subgroupNumber ? +subgroupNumber : undefined;

    return result;
}

export function scheduleParamsToUrl(params: ScheduleParams): string {
    let urlString = '?';
    for (const [paramName, paramValue] of Object.entries(params)) {
        if (paramValue !== undefined) {
            const encodedValue = paramName === 'sheetName' ? encodeURIComponent(paramValue) : paramValue;
            urlString += `${paramName}=${encodedValue}&`;
        }
    }
    return urlString;
}

function saveScheduleParamsToLocalStorage(params: ScheduleParams) {
    localStorage.setItem('scheduleParams', JSON.stringify(params));
}

function getScheduleParamsFromLocalStorage(): ScheduleParams | null {
    const paramsString = localStorage.getItem('scheduleParams');
    if (paramsString) {
        return JSON.parse(paramsString);
    }
    return null;
}

function removeScheduleParamsFromLocalStorage() {
    localStorage.removeItem('scheduleParams');
}

export const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        setData(state, action: PayloadAction<ParsingResult>) {
            state.data = action.payload;
            if (Object.keys(action.payload).length) {
                state.params.sheetIndex = 0;
                saveScheduleParamsToLocalStorage(state.params);
            }
        },
        // todo extract to middleware
        setParams(state, action: PayloadAction<ScheduleParams>) {
            // const params = {...state.params, ...action.payload};
            // fixme
            if (action.payload.url) {
                state.params.url = action.payload.url;
            }
            if (action.payload.year) {
                state.params.year = action.payload.year;
            }
            if (action.payload.groupNumber) {
                state.params.groupNumber = action.payload.groupNumber;
            }
            if (action.payload.subgroupNumber) {
                state.params.subgroupNumber = action.payload.subgroupNumber;
            }
            if (action.payload.sheetIndex !== undefined) {
                state.params.sheetIndex = action.payload.sheetIndex;
            }

            saveScheduleParamsToLocalStorage(state.params);

            // fixme absolute cringe
            const groups = state.data && (state.params.sheetIndex !== undefined ) ? Object.values(state.data)[state.params.sheetIndex] : [];
            const group = findStudyGroup(groups, state.params.year, state.params.groupNumber, state.params.subgroupNumber);
            if (group) {
                saveStudyGroupToLocalStorage(group);
            }
        },
        resetState(state) {
            state.data = null;
            state.params = {};
            state.loading = false;
            state.error = '';
            state.optionsTree = null;
            removeStudyGroupFromLocalStorage();
            removeScheduleParamsFromLocalStorage();
        },
    },
    extraReducers: {
        [fetchSpreadSheet.fulfilled.type]: (state, action: PayloadAction<ParsingResult>) => {
            state.data = action.payload;
            if (Object.keys(action.payload).length) {
                state.params.sheetIndex = 0;
                saveScheduleParamsToLocalStorage(state.params);
            }
            state.loading = false;
            state.error = '';
        },
        [fetchSpreadSheet.pending.type]: (state) => {
            state.loading = true;
        },
        [fetchSpreadSheet.rejected.type]: (state, action: PayloadAction<string>) => {
            state.data = null;
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {setData, setParams, resetState} = scheduleSlice.actions;
export default scheduleSlice.reducer;

export function useSchedule(): ScheduleState {
    return useAppSelector(state => state.schedule);
}

export function getGroupFromState(state: ScheduleState) {
    const groups = state.data && (state.params.sheetIndex !== undefined ) ? Object.values(state.data)[state.params.sheetIndex] : [];
    return findStudyGroup(groups, state.params.year, state.params.groupNumber, state.params.subgroupNumber);
}