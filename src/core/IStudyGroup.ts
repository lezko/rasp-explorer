import {ISchedule} from 'core/ISchedule';

export interface IStudyGroup {
    year: number;
    groupNumber: number;
    subgroupNumber?: number;
    specialization: string;
    additionalInfo: string[];
    schedule: ISchedule;
}