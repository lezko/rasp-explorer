export enum DayName {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday'
}

export const dayCount = 6;
export const lessonCount = 8;

// todo think about it :)
export const lessonScheduleTime = [
    ['8:00', '9:35'],
    ['9:45', '11:20'],
    ['11:30', '13:05'],
    ['13:25', '15:00'],
    ['15:10', '16:45'],
    ['16:55', '18:30'],
    ['18:40', '20:00'],
    ['20:10', '21:30'],
];

export interface ILesson {
    // todo parse these fields
    // title: string;
    // teacher: string;
    // room: string;

    description: string;
    time: typeof lessonScheduleTime[number];
}

export type IDay = ILesson[];

// should always contain 6 items
export type IWeek = IDay[];

export interface ISchedule {
    firstWeek: IWeek;
    secondWeek: IWeek;
}