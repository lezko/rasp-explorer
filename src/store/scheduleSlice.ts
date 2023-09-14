import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchSpreadSheet} from 'store/scheduleActionCreators';
import {ParsingResult} from 'core/ScheduleParser';
import {useAppSelector} from 'store/index';
import {findStudyGroup, saveStudyGroupToLocalStorage, setScheduleParamsToUrl} from 'utils/scheduleUtils';

export interface ScheduleParams {
    url?: string;
    sheetName?: string;
    year?: number;
    groupNumber?: number;
    subgroupNumber?: number;
}

export interface ScheduleState {
    data: ParsingResult;
    loading: boolean;
    error: string;
    params: ScheduleParams;
}

const initialState: ScheduleState = {
    data: {},
    loading: false,
    error: '',
    params: getScheduleParamsFromLocalStorage() || {}
};

export function parseScheduleParams(url: string): ScheduleParams {
    const params = new URLSearchParams(url);
    const result: ScheduleParams = {};
    result.url = params.get('url') || undefined;
    result.sheetName = params.get('sheetName') || undefined;

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


export const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        setData(state, action: PayloadAction<ParsingResult>) {
            state.data = action.payload;
        },
        // todo extract to middleware
        setParams(state, action: PayloadAction<Partial<ScheduleParams>>) {
            const params = {...state.params, ...action.payload};
            saveScheduleParamsToLocalStorage(params);
            setScheduleParamsToUrl(params);
            // fixme absolute cringe
            const group = findStudyGroup(params.sheetName ? state.data[params.sheetName] || []: [], params.year, params.groupNumber, params.subgroupNumber);
            if (group) {
                saveStudyGroupToLocalStorage(group);
            }
            state.params = params;
        },
        setParamsFromString(state, action: PayloadAction<string>) {
            const partialParams = parseScheduleParams(action.payload) as Partial<ScheduleParams>;
            const params = {...state.params, ...partialParams};
            saveScheduleParamsToLocalStorage(params);
            setScheduleParamsToUrl((params));
            const group = findStudyGroup(params.sheetName ? state.data[params.sheetName] || []: [], params.year, params.groupNumber, params.subgroupNumber);
            if (group) {
                saveStudyGroupToLocalStorage(group);
            }
            state.params = params;
        },
    },
    extraReducers: {
        [fetchSpreadSheet.fulfilled.type]: (state, action: PayloadAction<ParsingResult>) => {
            state.data = action.payload;
            state.loading = false;
            state.error = '';
            const params = state.params;
            const group = findStudyGroup(params.sheetName ? action.payload[params.sheetName] || []: [], params.year, params.groupNumber, params.subgroupNumber);
            if (group) {
                saveStudyGroupToLocalStorage(group);
            }
        },
        [fetchSpreadSheet.pending.type]: (state) => {
            state.loading = true;
        },
        [fetchSpreadSheet.rejected.type]: (state, action: PayloadAction<string>) => {
            state.data = {};
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {setData, setParams, setParamsFromString} = scheduleSlice.actions;
export default scheduleSlice.reducer;

export function useSchedule(): ScheduleState {
    return useAppSelector(state => state.schedule);
}