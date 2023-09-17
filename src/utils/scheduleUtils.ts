import {IStudyGroup} from 'core/IStudyGroup';
import exp from 'constants';
import {ScheduleParams, scheduleParamsToUrl} from 'store/scheduleSlice';
import deepEqual from 'deep-equal';

export function saveStudyGroupToLocalStorage(studyGroup: IStudyGroup) {
    localStorage.setItem('studyGroup', JSON.stringify(studyGroup));
}

export function getStudyGroupFromLocalStorage(): IStudyGroup | null {
    const groupString = localStorage.getItem('studyGroup');
    if (groupString) {
        return JSON.parse(groupString);
    }
    return null;
}

export function removeStudyGroupFromLocalStorage() {
    localStorage.removeItem('studyGroup');
}

// todo optimize
export function findStudyGroup(
    studyGroups: IStudyGroup[],
    year: number | undefined,
    groupNumber: number | undefined,
    subgroupsNumber: number | undefined
): IStudyGroup | null {
    for (const g of studyGroups) {
        if (g.year === year && g.groupNumber === groupNumber) {
            if ((!g.subgroupNumber || g.subgroupNumber === subgroupsNumber)) {
                return g;
            }
        }
    }
    return null;
}

export function getOptionsObject(studyGroups: IStudyGroup[]): any {
    const result: any = {};
    for (const g of studyGroups) {
        if (!(g.year in result)) {
            result[g.year] = {};
        }
        if (!(g.groupNumber in result[g.year])) {
            result[g.year][g.groupNumber] = {};
        }
        if (g.subgroupNumber) {
            result[g.year][g.groupNumber][g.subgroupNumber] = {};
        }
    }
    return result;
}

type StudyGroupDifference = { week: number, day: number }[];

export function getStudyGroupDifference(g1: IStudyGroup, g2: IStudyGroup): StudyGroupDifference {
    const result: StudyGroupDifference = [];
    for (let i = 0; i < 6; i++) {
        if (!deepEqual(g1.schedule.firstWeek[i], g2.schedule.firstWeek[i])) {
            result.push({week: 1, day: i});
        }
        if (!deepEqual(g1.schedule.secondWeek[i], g2.schedule.secondWeek[i])) {
            result.push({week: 2, day: i});
        }
    }
    return result;
}

export function setScheduleParamsToUrl(params: ScheduleParams) {
    window.history.replaceState(null, document.title, window.location.origin + window.location.pathname + scheduleParamsToUrl(params));
}

export function getLastUpdateTimeString(time: number) {
    const t = Date.now() - time;
    console.log(t);
    const msInMinute = 1000 * 60;
    const msInHour = msInMinute * 60;
    const msInDay = msInHour * 24;

    const d = Math.floor(t / msInDay);
    if (d > 0) {
        return `Сохранено ${d}д назад`;
    }

    const h = Math.floor(t / msInHour);
    if (h > 0) {
        return `Сохранено ${h}ч назад`;
    }

    const m = Math.floor(t / msInMinute);
    if (m > 0) {
        return `Сохранено ${m}м назад`;
    }

    return `Сохранено менее минуты назад`;
}