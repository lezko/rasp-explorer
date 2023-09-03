import * as XLSX from 'xlsx';
import {IStudyGroup} from 'core/IStudyGroup';

type ParsingResult = {[key: string]: IStudyGroup[]};
export function parseWorkbook(wb: XLSX.WorkBook): ParsingResult {
    const result: ParsingResult = {}
    for (const [sheetName, sheet] of Object.entries(wb.Sheets)) {
        try {
            result[sheetName] = parseSheet(sheet);
        } catch (e: any) {
            // todo error handling
        }
    }

    return result;
}

// todo check keywords
const keyWords = ['Понедельник', 'Вторник', 'Группа', 'Курс', 'Направление', 'Специальность', 'Профиль'];
function parseSheet(sheet: XLSX.Sheet): IStudyGroup[] {
    const table = XLSX.utils.sheet_to_json(sheet, {header: 1}) as string[][];
    const merges = sheet['!merges'];
    appendEmptyCells(table);

    if (!merges) {
        throw new Error('No merges found on this sheet. Invalid file format.');
    }
    for (const m of merges) {
        fillRange(table, m);
    }

    console.log(table);
    return [];
}

function appendEmptyCells(table: string[][]) {
    let maxLength = 0;
    for (const arr of table) {
        maxLength = Math.max(maxLength, arr.length);
    }
    for (const arr of table) {
        while (arr.length < maxLength) {
            arr.push('');
        }
    }
}

function fillRange(table: string[][], r: XLSX.Range) {
    let value = '';
    for (let row = r.s.r; row <= r.e.r; row++) {
        for (let col = r.s.c; col <= r.e.c; col++) {
            if (table[row][col]) {
                value = table[row][col];
                break
            }
        }
        if (value) {
            break;
        }
    }
    for (let row = r.s.r; row <= r.e.r; row++) {
        for (let col = r.s.c; col <= r.e.c; col++) {
            if (!table[row][col]) {
                table[row][col] = value;
            }
        }
    }
}