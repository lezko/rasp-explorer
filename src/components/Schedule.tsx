import {IStudyGroup} from 'core/IStudyGroup';
import {useState} from 'react';
import styles from 'scss/components/Schedule.module.scss';
import Week from 'components/Week';
import {getCurrentWeekNumber} from 'core/ScheduleParser';
import {findStudyGroup, getStudyGroupFromLocalStorage} from 'utils/scheduleUtils';
import {useSchedule} from 'store/scheduleSlice';
import StudyGroupSelect from 'components/StudyGroupSelect';
import Spinner from 'components/Spinner';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleCheck} from '@fortawesome/free-solid-svg-icons';

const Schedule = () => {
    const {data, loading, error, params} = useSchedule();
    const {sheetIndex, year, groupNumber, subgroupNumber, url} = params;
    const currentWeekNumber = getCurrentWeekNumber();
    const [weekNumber, setWeekNumber] = useState(currentWeekNumber); // todo restrict values to just two of them
    // const [scheduleState, setScheduleState] = useState<'offline' | 'checking' | 'upToDate' | 'default'>('default');

    let scheduleState = null;
    const hasData = Object.keys(data).length > 0;
    const groups = hasData && (sheetIndex !== undefined) ? Object.values(data)[sheetIndex] : [];
    let studyGroup = findStudyGroup(groups, year, groupNumber, subgroupNumber);
    const savedGroup = getStudyGroupFromLocalStorage();


    if (savedGroup && savedGroup.year === year && savedGroup.groupNumber === groupNumber && savedGroup.subgroupNumber === subgroupNumber) {
        if (loading || error) {
            scheduleState = error ? <>Offline view</> : <>Checking for updates <Spinner /></>;
            studyGroup = savedGroup;
        } else {
            scheduleState = <>Up to date <FontAwesomeIcon icon={faCircleCheck} /></>;
        }
    } else if (loading) {
        scheduleState = <>Loading <Spinner /></>;
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
            <StudyGroupSelect />
            <h4 style={{margin: '30px 0 10px 0'}}>{scheduleState}</h4>

            {studyGroup &&
                <div>
                    {getGroupInfoHtml(studyGroup)}
                    <span>Неделя:</span>
                    <select
                        style={{marginBlock: 10}}
                        value={String(weekNumber)}
                        onChange={e => setWeekNumber(+e.target.value)}
                    >
                        <option value="1">1 {currentWeekNumber === 1 ? '(текущая)' : ''}</option>
                        <option value="2">2 {currentWeekNumber === 2 ? '(текущая)' : ''}</option>
                    </select>

                    <Week week={weekNumber === 1 ? studyGroup.schedule.firstWeek :
                        studyGroup.schedule.secondWeek
                    } />
                </div>
            }
        </div>
    );
};

export default Schedule;