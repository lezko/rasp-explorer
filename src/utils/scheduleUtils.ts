import {IStudyGroup} from 'core/IStudyGroup';
import exp from 'constants';
import {ScheduleParams, scheduleParamsToUrl} from 'store/scheduleSlice';

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

export function setScheduleParamsToUrl(params: ScheduleParams) {
    window.history.replaceState(null, document.title, window.location.origin + window.location.pathname + scheduleParamsToUrl(params));
}