import {IStudyGroup} from 'core/IStudyGroup';

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