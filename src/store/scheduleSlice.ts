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

export function parseScheduleParams(urlString: string): ScheduleParams {
    const params = new URLSearchParams(urlString);
    const result: ScheduleParams = {};

    const url = params.get('url');
    if (url) {
        result.url = url
    }

    const sheetIndex = params.get('sheetIndex');
    if (sheetIndex !== undefined && sheetIndex !== null) {
        result.sheetIndex = +sheetIndex;
    }

    const year = params.get('year');
    if (year) {
        result.year = +year;
    }

    const groupNumber = params.get('groupNumber');
    if (groupNumber) {
        result.groupNumber = +groupNumber;
    }

    const subgroupNumber = params.get('subgroupNumber');
    if (subgroupNumber) {
        result.subgroupNumber = +subgroupNumber;
    }

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
            state.params = {...state.params, ...action.payload};
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
            // if (Object.keys(action.payload).length) {
            //     state.params.sheetIndex = 0;
            //     saveScheduleParamsToLocalStorage(state.params);
            // }
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