import {IStudyGroup} from 'core/IStudyGroup';
import {FC, useState} from 'react';
import styles from 'scss/components/Schedule.module.scss';
import Week from 'components/Week';
import {getCurrentWeekNumber} from 'core/ScheduleParser';
import config from 'config.json';

interface ScheduleProps {
    groups: IStudyGroup[];
    searchParams: URLSearchParams;
}

const Schedule: FC<ScheduleProps> = ({groups, searchParams}) => {
    let p: any = {};
    if (searchParams.has('url')) {
        p.year = Number(searchParams.get('year')) || undefined;
        p.groupNumber = Number(searchParams.get('groupNumber')) || undefined;
        p.subgroupNumber = Number(searchParams.get('subgroupNumber')) || undefined;
    }

    // todo memo optimization
    const [year, setYear] = useState<number | undefined>(p.year);
    const [groupNumber, setGroupNumber] = useState<number | undefined>(year ? p.groupNumber : undefined);
    const [subgroupNumber, setSubgroupNumber] = useState<number | undefined>((year && groupNumber) ? p.subgroupNumber : undefined);
    const currentWeekNumber = getCurrentWeekNumber();
    const [weekNumber, setWeekNumber] = useState(currentWeekNumber); // todo restrict values to just two of them

    const years = Array.from(groups.reduce((s, g) => {
        if (!s.has(g.year)) {
            s.add(g.year);
        }
        return s;
    }, new Set())) as number[];

    function getGroupNumbers(year: number): number[] {
        const s = new Set<number>();
        for (const group of groups) {
            if (group.year === year) {
                s.add(group.groupNumber);
            }
        }
        return Array.from(s);
    }

    function getSubgroupNumbers(year: number, groupNumber: number): number[] {
        const s = new Set<number>();
        for (const group of groups) {
            if (group.year === year && group.groupNumber === groupNumber) {
                if (group.subgroupNumber) {
                    s.add(group.subgroupNumber);
                }
            }
        }
        return Array.from(s);
    }

    function getGroup(year: number, groupNumber: number, subgroupNumber?: number): IStudyGroup {
        for (const group of groups) {
            if (group.year === year && group.groupNumber === groupNumber && (!subgroupNumber || group.subgroupNumber === subgroupNumber)) {
                return group;
            }
        }
        throw new Error(`Group not found: year ${year}, groupNumber ${groupNumber}, subgroupNumber ${subgroupNumber}`);
    }

    function getGroupInfoHtml(group: IStudyGroup) {
        return (
            <>
                <h2>{group.specialization}</h2>
                <h4>{group.additionalInfo.join(' ')}</h4>
            </>
        );
    }

    return (
        <div className={styles.schedule}>
            <span>Курс:</span>
            <select value={String(year) || ''} onChange={e => {
                setGroupNumber(undefined);
                setSubgroupNumber(undefined);
                setYear(+e.target.value || undefined);
            }}>
                <option value=""></option>
                {years.map(y =>
                    <option key={y} value={String(y)}>{y}</option>
                )}
            </select>
            <br/>

            <span>Группа:</span>
            <select value={String(groupNumber) || ''} onChange={e => {
                setSubgroupNumber(undefined);
                setGroupNumber(+e.target.value || undefined);
            }}>
                <option value=""></option>
                {year && getGroupNumbers(year).map((gn, i) =>
                    <option key={i} value={gn}>{gn}</option>
                )}
            </select>
            <br/>

            <span>Подгруппа:</span>
            <select value={String(subgroupNumber) || ''}
                    onChange={e => setSubgroupNumber(+e.target.value || undefined)}>
                <option value=""></option>
                {year && groupNumber && getSubgroupNumbers(year, groupNumber).map((sgn, i) =>
                    <option key={i} value={sgn}>{sgn}</option>
                )}
            </select>
            <br/>

            {year && groupNumber && (!getSubgroupNumbers(year, groupNumber).length || subgroupNumber) &&
                <div style={{marginTop: 20}}>
                    {getGroupInfoHtml(getGroup(year, groupNumber, subgroupNumber))}
                    <span>Неделя:</span>
                    <select
                        style={{marginBlock: 10}}
                        value={String(weekNumber)}
                        onChange={e => setWeekNumber(+e.target.value)}
                    >
                        <option value="1">1 {currentWeekNumber === 1 ? '(текущая)': ''}</option>
                        <option value="2">2 {currentWeekNumber === 2 ? '(текущая)': ''}</option>
                    </select>
                    <br/>

                    {searchParams.has('url') && year && groupNumber && (!getSubgroupNumbers(year, groupNumber).length || subgroupNumber) && <button style={{marginBlock: 10}} onClick={() => {
                        const params = `&year=${year}&groupNumber=${groupNumber}&subgroupNumber=${subgroupNumber}`;
                        navigator.clipboard.writeText(config.baseUrl + '?url=' + searchParams.get('url') + params);
                    }}>Скопировать ссылку на текущее расписание</button>}

                    <Week week={weekNumber === 1 ? getGroup(year, groupNumber, subgroupNumber).schedule.firstWeek :
                        getGroup(year, groupNumber, subgroupNumber).schedule.secondWeek
                    } />
                </div>
            }
        </div>
    );
};

export default Schedule;