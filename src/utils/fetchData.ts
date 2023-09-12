import * as XLSX from 'xlsx';
import {parseWorkbook} from 'core/ScheduleParser';

export async function getSpreadSheetByUrl(url: string): Promise<ReturnType<typeof parseWorkbook>> {
    return await fetch(url).then(res => res.arrayBuffer()).then(data => {
        const wb = XLSX.read(data, {type: 'binary'});
        return parseWorkbook(wb);
    });
}