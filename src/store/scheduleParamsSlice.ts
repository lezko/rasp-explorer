import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useAppSelector} from 'store/index';

export interface ScheduleParamsState {
    url?: string;
    sheetName?: string;
    year?: number;
    groupNumber?: number;
    subgroupNumber?: number;
}

export function parseScheduleParams(url: string): ScheduleParamsState {
    const params = new URLSearchParams(url);
    const result: ScheduleParamsState = {};
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

export function scheduleParamsToUrl(params: ScheduleParamsState): string {
    let urlString = '?';
    for (const [paramName, paramValue] of Object.entries(params)) {
        if (paramValue !== undefined) {
            urlString += `${paramName}=${paramValue}&`;
        }
    }
    return urlString;
}

function saveScheduleParamsToLocalStorage(params: ScheduleParamsState) {
    localStorage.setItem('scheduleParams', JSON.stringify(params));
}

function getScheduleParamsFromLocalStorage(): ScheduleParamsState | null {
    const paramsString = localStorage.getItem('scheduleParams');
    if (paramsString) {
        return JSON.parse(paramsString);
    }
    return null;
}

export const scheduleParamsSlice = createSlice({
    name: 'scheduleParams',
    initialState: getScheduleParamsFromLocalStorage() || {},
    reducers: {
        setScheduleParams(state, action: PayloadAction<Partial<ScheduleParamsState>>) {
            const nextParams = {...state, ...action.payload};
            saveScheduleParamsToLocalStorage(nextParams);
            return nextParams;
        },
        setScheduleParamsFromString(state, action: PayloadAction<string>) {
            const params = parseScheduleParams(action.payload);
            saveScheduleParamsToLocalStorage(params);
            return params;
        },
    }
});

export const {setScheduleParams, setScheduleParamsFromString} = scheduleParamsSlice.actions;
export default scheduleParamsSlice.reducer;

export function useScheduleParams(): ScheduleParamsState {
    return useAppSelector(state => state.scheduleParams);
}