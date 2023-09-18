import * as XLSX from 'xlsx';
import {IStudyGroup} from 'core/IStudyGroup';
import {dayCount, ILesson, IWeek, lessonCount, lessonScheduleTime} from 'core/ISchedule';
import config from 'config.json';

export type ParsingResult = { [key: string]: IStudyGroup[] };

export function parseWorkbook(wb: XLSX.WorkBook): ParsingResult {
    const result: ParsingResult = {};
    for (const [sheetName, sheet] of Object.entries(wb.Sheets)) {
        try {
            result[sheetName] = parseSheet(sheet);
        } catch (e: any) {
            // todo error handling
            console.error(e.message);
        }
    }

    return result;
}

// todo check keywords
const keyWords = ['понедельник', 'вторник', 'группа', 'курс', 'направление'];

function parseSheet(sheet: XLSX.Sheet): IStudyGroup[] {
    let table = XLSX.utils.sheet_to_json(sheet, {header: 1}) as string[][];
    const merges = sheet['!merges'];
    appendEmptyCells(table);

    if (!merges || !checkKeywords(table)) {
        throw new Error('Invalid file format.');
    }
    for (const m of merges) {
        fillRange(table, m);
    }
    table = removeEmptyColumns(table);
    table = removeEmptyRows(table);

    const groups: IStudyGroup[] = [];
    const rowStartIdx = 4;
    const colStartIdx = 2;
    const yearIdx = 0;
    const groupIdx = 1;
    const specializationIdx = 2;
    const additionalInfoIdx = 3;

    for (let col = colStartIdx; col < table[0].length; col++) {
        const group = {} as IStudyGroup;
        try {
            group.year = extractNumberFromStr(table[yearIdx][col]);
            group.groupNumber = extractNumberFromStr(table[groupIdx][col]);
        } catch (e: any) {
            console.error(`Failed to process group with year ${table[yearIdx][col]} and group number ${table[groupIdx][col]}`);
            continue;
        }
        group.specialization = table[specializationIdx][col];
        group.additionalInfo = [table[additionalInfoIdx][col]];

        const week1 = Array.from(Array(dayCount), () => []) as IWeek;
        const week2 = Array.from(Array(dayCount), () => []) as IWeek;
        let k = 0;
        for (let row = rowStartIdx; row < table.length; row++) {
            const lesson = {} as ILesson;
            lesson.description = table[row][col];
            if (lesson.description) {
                lesson.time = lessonScheduleTime[Math.floor((k % (lessonCount * 2)) / 2)];
                const week = k % 2 === 0 ? week1 : week2;
                week[Math.floor(k / (lessonCount * 2))].push(lesson);
            }
            k++;
        }

        // set subgroup number
        if (groups.length) {
            const lastGroup = groups[groups.length - 1];
            if (lastGroup.groupNumber === group.groupNumber) {
                if (!lastGroup.subgroupNumber) {
                    lastGroup.subgroupNumber = 1;
                }
                group.subgroupNumber = lastGroup.subgroupNumber + 1;
            }
        }


        group.schedule = {
            firstWeek: week1,
            secondWeek: week2
        };
        groups.push(group);
    }


    // console.log(groups);
    // console.log(table);
    return groups;
}

function checkKeywords(table: string[][]) {
    const wordsSet = new Set();
    for (const row of table) {
        for (const item of row) {
            if (!item) {
                continue;
            }
            const str = String(item).toLowerCase();
            for (const keyWord of keyWords) {
                if (str.includes(keyWord) && !wordsSet.has(keyWord)) {
                    wordsSet.add(keyWord);
                }
            }
        }
    }
    return wordsSet.size === keyWords.length;
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
                break;
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

function removeEmptyRows(table: string[][]): string[][] {
    const result = [];
    for (let r = 0; r < table.length; r++) {
        let hasNonEmptyItems = false;
        for (let c = 0; c < table[0].length; c++) {
            if (table[r][c]) {
                hasNonEmptyItems = true;
                break;
            }
        }
        if (hasNonEmptyItems) {
            result.push(table[r]);
        }
    }
    return result;
}

function removeEmptyColumns(table: string[][]): string[][] {
    const emptyIndexes = [];
    for (let c = 0; c < table[0].length; c++) {
        let hasNonEmptyValues = false;
        for (let r = 0; r < table.length; r++) {
            if (table[r][c]) {
                hasNonEmptyValues = true;
                break;
            }
        }
        if (!hasNonEmptyValues) {
            emptyIndexes.push(c);
        }
    }
    const result = [];
    for (let r = 0; r < table.length; r++) {
        const newRow = [];
        for (let c = 0; c < table[0].length; c++) {
            if (!emptyIndexes.includes(c)) {
                newRow.push(table[r][c]);
            }
        }
        result.push(newRow);
    }
    return result;
}

function extractNumberFromStr(str: string) {
    const matches = str.match(/(\d+)/);
    if (!matches) {
        throw new Error(`Failed to extract number from string '${str}'`);
    }
    return +matches[0];
}

export function getCurrentWeekNumber() {
    const start = new Date(config.weekNumber.date);
    const now = new Date();
    const weeksPassed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60 / 60 / 24 / 7);
    let weekNumber;
    if (weeksPassed % 2 === 0) {
        weekNumber = config.weekNumber.number;
    } else {
        weekNumber = config.weekNumber.number === 1 ? 2 : 1;
    }
    return weekNumber;
}