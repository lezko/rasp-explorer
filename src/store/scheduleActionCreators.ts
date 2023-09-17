import {createAsyncThunk} from '@reduxjs/toolkit';
import * as XLSX from 'xlsx';
import {parseWorkbook} from 'core/ScheduleParser';
import language from 'language.json';

const lang = language.ru;

export const fetchSpreadSheet = createAsyncThunk(
    'spreadsheet/fetch',
    async (url: string, thunkAPI) => {
        try {
            return await fetch(url).then(res => res.arrayBuffer()).then(data => {
                const wb = XLSX.read(data, {type: 'binary'});
                const schedules = parseWorkbook(wb);
                if (!Object.keys(schedules).length) {
                    throw new Error(lang.fileContentError);
                }
                return schedules;
            });
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.message);
        }
    }
);