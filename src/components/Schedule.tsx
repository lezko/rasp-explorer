import {IStudyGroup} from 'core/IStudyGroup';
import {useEffect, useState} from 'react';
import Week from 'components/Week';
import {getCurrentWeekNumber} from 'core/ScheduleParser';
import {
    getLastUpdateTimeString,
    getStudyGroupDifference,
    getStudyGroupFromLocalStorage,
    saveStudyGroupToLocalStorage
} from 'utils/scheduleUtils';
import {getGroupFromState, ScheduleParams, setParams, useSchedule} from 'store/scheduleSlice';
import StudyGroupSelect from 'components/StudyGroupSelect';
import Spinner from 'components/Spinner';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleCheck, faAngleUp, faAngleDown} from '@fortawesome/free-solid-svg-icons';
import {Modal, Select} from 'antd';
import {DayName} from 'core/ISchedule';
import {getCacheFromLocalStorage, saveCacheToLocalStorage} from 'utils/cacheStorage';
import {useAppDispatch} from 'store';
import language from 'language.json';
import {setSettings, useSettings} from 'store/settingsSlice';

const lang = language.ru;

const Schedule = () => {
    const state = useSchedule();
    const dispatch = useAppDispatch();
    const cache = getCacheFromLocalStorage();
    const {data, loading, error, params} = state;
    const {sheetIndex, year, groupNumber, subgroupNumber, url} = params;
    const currentWeekNumber = getCurrentWeekNumber();
    const [weekNumber, setWeekNumber] = useState(currentWeekNumber); // todo restrict values to just two of them
    const {showSpecialization} = useSettings();
    // const [scheduleState, setScheduleState] = useState<'offline' | 'checking' | 'upToDate' | 'default'>('default');

    const [{info}, contextHolder] = Modal.useModal();
    let scheduleState: 'default' | 'offline' | 'localOffline' | 'checking' | 'loading' | 'upToDate' = 'default';
    let studyGroup = getGroupFromState(state);
    const savedGroup = getStudyGroupFromLocalStorage();

    const [studyGroupDiff, setStudyGroupDiff] = useState<ReturnType<typeof getStudyGroupDifference> | null>(null);

    if (savedGroup && savedGroup.year === year && savedGroup.groupNumber === groupNumber && savedGroup.subgroupNumber === subgroupNumber) {

        if (loading || error) {
            scheduleState = error ? 'offline' : 'checking';
            studyGroup = savedGroup;
        } else {
            if (studyGroup && url) {
                const diff = getStudyGroupDifference(studyGroup, savedGroup);
                if (diff.length) {
                    setStudyGroupDiff(diff);
                }
                saveStudyGroupToLocalStorage(studyGroup);
                scheduleState = 'upToDate';
            } else {
                // from local file
                studyGroup = savedGroup;
                scheduleState = 'localOffline';
            }
        }
    } else {
        if (loading) {
            scheduleState = 'loading';
        } else if (url && studyGroup) {
            scheduleState = 'upToDate';
            saveStudyGroupToLocalStorage(studyGroup);
        }
    }

    const stateToElement = {
        default: null,
        offline: <>
            <div>
                Offline view
            </div>
            <span
                style={{fontSize: '.8rem', color: 'gray', fontWeight: 400, fontStyle: 'italic'}}
            >
                {cache && getLastUpdateTimeString(cache.lastUpdateTime)}
            </span>
        </>,
        localOffline: <>Offline view</>,
        upToDate: <>Up to date <FontAwesomeIcon icon={faCircleCheck} /></>,
        checking: <>Checking for updates <Spinner /></>,
        loading: <>Loading <Spinner /></>
    };

    function getGroupInfoHtml(group: IStudyGroup) {
        return (
            <>
                <h2>{group.specialization}</h2>
                <h4>{group.additionalInfo.join(' ')}</h4>
            </>
        );
    }

    const sheetNames = data ? Object.keys(data) : [];

    function handleSelectedScheduleChange(sheetIndex: number) {
        const nextParams = {
            sheetIndex
        } as ScheduleParams;
        if (sheetIndex !== params.sheetIndex) {
            nextParams.year = undefined;
            nextParams.groupNumber = undefined;
            nextParams.subgroupNumber = undefined;
        }
        saveCacheToLocalStorage({sheetName: sheetNames[sheetIndex]});
        dispatch(setParams(nextParams));
    }

    useEffect(() => {
        if (studyGroupDiff) {
            info({
                title: 'Изменения в расписании',
                okButtonProps: {type: 'default'},
                content: <div style={{maxHeight: 100, overflowY: 'auto'}}>
                    <ul>{studyGroupDiff.map((d, i) =>
                        <li key={i}>{d.week === 1 ? lang.week.long['1'] : lang.week.long['2']}, {DayName[d.day]}</li>
                    )}</ul>
                </div>
            });
            setStudyGroupDiff(null);
        }
    }, [studyGroupDiff]);

    return (
        <div>
            {contextHolder}

            {(data || studyGroup || scheduleState === 'checking') &&
                <Select
                    disabled={!data}
                    style={{marginBottom: 10, width: 250}}
                    onChange={handleSelectedScheduleChange}
                    value={params.sheetIndex}
                    options={data ? sheetNames.map((s, i) => ({
                        value: i, label: s
                    })) : [{value: sheetIndex, label: cache?.sheetName}]}
                />
            }

            {(data || studyGroup || scheduleState === 'checking') && <StudyGroupSelect />}
            {scheduleState === 'loading' ?
                <center><Spinner style={{marginTop: 30, width: 30, height: 30}} /></center>
                :
                <h4 style={{margin: '20px 0 10px 0'}}>{stateToElement[scheduleState]}</h4>
            }

            {studyGroup &&
                <div>
                    <div
                        style={{display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '.9rem', marginTop: 10, fontStyle: 'italic'}}
                        onClick={() => dispatch(setSettings({showSpecialization: !showSpecialization}))}
                    >
                        <span>{showSpecialization ? lang.hideSpecialization : lang.showSpecialization}</span>
                        <FontAwesomeIcon style={{marginLeft: 5}} icon={showSpecialization ? faAngleUp : faAngleDown} />
                    </div>
                    {showSpecialization && getGroupInfoHtml(studyGroup)}

                    <div>
                        <span>Неделя:</span>
                        <Select
                            style={{width: 160, marginLeft: 5, marginBlock: 10}}
                            options={[
                                {value: 1, label: lang.week.short['1'] + (currentWeekNumber === 1 ? ' (текущая)' : '')},
                                {value: 2, label: lang.week.short['2'] + (currentWeekNumber === 2 ? ' (текущая)' : '')}
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