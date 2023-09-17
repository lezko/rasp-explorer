import {IStudyGroup} from 'core/IStudyGroup';
import {useState} from 'react';
import styles from 'scss/components/Schedule.module.scss';
import Week from 'components/Week';
import {getCurrentWeekNumber} from 'core/ScheduleParser';
import {
    findStudyGroup, getLastUpdateTimeString,
    getStudyGroupDifference,
    getStudyGroupFromLocalStorage,
    saveStudyGroupToLocalStorage
} from 'utils/scheduleUtils';
import {getGroupFromState, useSchedule} from 'store/scheduleSlice';
import StudyGroupSelect from 'components/StudyGroupSelect';
import Spinner from 'components/Spinner';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleCheck} from '@fortawesome/free-solid-svg-icons';
import {useAppSelector} from 'store';
import {Modal, Select} from 'antd';
import {DayName} from 'core/ISchedule';
import styled from 'styled-components';
import {getCacheFromLocalStorage} from 'utils/cacheStorage';

const Schedule = () => {
    const state = useSchedule();
    const cache = getCacheFromLocalStorage();
    const {data, loading, error, params} = state;
    const {sheetIndex, year, groupNumber, subgroupNumber, url} = params;
    const currentWeekNumber = getCurrentWeekNumber();
    const [weekNumber, setWeekNumber] = useState(currentWeekNumber); // todo restrict values to just two of them
    // const [scheduleState, setScheduleState] = useState<'offline' | 'checking' | 'upToDate' | 'default'>('default');

    // const [{confirm}, contextHolder] = Modal.useModal()
    const {info} = Modal;
    let scheduleState: 'default' | 'offline' | 'localOffline' | 'checking' | 'loading' | 'upToDate' = 'default';
    let studyGroup = getGroupFromState(state);
    const savedGroup = getStudyGroupFromLocalStorage();

    if (savedGroup && savedGroup.year === year && savedGroup.groupNumber === groupNumber && savedGroup.subgroupNumber === subgroupNumber) {
        if (loading || error) {
            scheduleState = error ? 'offline' : 'checking';
            studyGroup = savedGroup;
        } else {
            if (studyGroup && url) {
                const diff = getStudyGroupDifference(studyGroup, savedGroup);
                if (diff.length) {
                    info({
                        title: 'Изменения в расписании',
                        content: <div>
                            <ul>{diff.map((d, i) =>
                                <li key={i}>Неделя {d.week}, {DayName[d.day]}</li>
                            )}</ul>
                        </div>
                    });
                }
                saveStudyGroupToLocalStorage(studyGroup);
                scheduleState = 'upToDate'
            } else {
                // from local file
                studyGroup = savedGroup;
                scheduleState = 'localOffline';
            }
        }
    } else if (loading) {
        scheduleState = 'loading';
    }

    const stateToElement = {
        default: null,
        offline: <>
            <div>
                Offline view
            </div>
            <span style={{fontSize: '.8rem'}}>{cache && getLastUpdateTimeString(cache.lastUpdateTime)}</span>
        </>,
        localOffline: <>Offline view</>,
        upToDate: <>Up to date <FontAwesomeIcon icon={faCircleCheck} /></>,
        checking: <>Checking for updates <Spinner /></>,
        loading: <>Loading <Spinner /></>
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
            {(data || scheduleState === 'checking') && <StudyGroupSelect />}
            <h4 style={{margin: '20px 0 10px 0'}}>{stateToElement[scheduleState]}</h4>

            {studyGroup &&
                <div>
                    {getGroupInfoHtml(studyGroup)}

                    <div>
                        <span>Неделя:</span>
                        <Select
                            style={{width: 120, marginLeft: 5, marginBlock: 10}}
                            options={[
                                {value: 1, label: '1 ' + (currentWeekNumber === 1 ? '(текущая)' : '')},
                                {value: 2, label: '2 ' + (currentWeekNumber === 2 ? '(текущая)' : '')}
                            ]}
                            value={weekNumber}
                            onChange={value => setWeekNumber(+value)}
                        />
                    </div>

                    <Week week={weekNumber === 1 ? studyGroup.schedule.firstWeek :
                        studyGroup.schedule.secondWeek
                    } />
                </div>
            }
        </div>
    );
};

export default Schedule;