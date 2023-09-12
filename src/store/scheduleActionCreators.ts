import {createAsyncThunk} from '@reduxjs/toolkit';
import * as XLSX from 'xlsx';
import {parseWorkbook} from 'core/ScheduleParser';

export const fetchSpreadSheet = createAsyncThunk(
    'spreadsheet/fetch',
    async (url: string, thunkAPI) => {
        return await fetch(url).then(res => res.arrayBuffer()).then(data => {
            const wb = XLSX.read(data, {type: 'binary'});
            return parseWorkbook(wb);
        });
    }
)