import {ChangeEvent, useEffect} from 'react';
import Schedule from 'components/Schedule';
import {useAppDispatch} from 'store';
import {
    parseScheduleParams,
    ScheduleParamsState,
    setScheduleParams,
    useScheduleParams
} from 'store/scheduleParamsSlice';
import FileSelect from 'components/FileSelect';
import {getStudyGroupFromLocalStorage} from 'utils/scheduleUtils';
import {fetchSpreadSheet} from 'store/scheduleActionCreators';
import {setSchedule, useSchedule} from 'store/scheduleSlice';

function App() {
    const dispatch = useAppDispatch();
    const params = useScheduleParams();
    const {error, loading, studyGroups} = useSchedule();
    useEffect(() => {
        let finalParams = {...params};
        const searchString = window.location.search;
        if (searchString) {
            const urlParams = parseScheduleParams(searchString);
            dispatch(setScheduleParams(urlParams));
            window.history.replaceState(null, document.title, window.location.origin);
            finalParams = {...finalParams, ...urlParams};
        }
        if (finalParams.url) {
            dispatch(fetchSpreadSheet(finalParams.url));
        }
    }, []);

    function handleSelectedScheduleChange(e: ChangeEvent<HTMLSelectElement>) {
        const sheetName = e.target.value;
        const nextParams = {
            sheetName
        } as ScheduleParamsState;
        if (sheetName !== params.sheetName) {
            nextParams.year = undefined;
            nextParams.groupNumber = undefined;
            nextParams.subgroupNumber = undefined;
        }
        dispatch(setScheduleParams(nextParams));
    }

    return (
        <div className="app">
            <div className="container">
                <FileSelect onFileLoaded={schedules => {
                    dispatch(setSchedule(schedules));
                    dispatch(setScheduleParams({sheetName: Object.keys(schedules)[0]}));
                }} />

                {studyGroups &&
                    <select style={{marginBlock: 10}} onChange={handleSelectedScheduleChange} value={params.sheetName}>
                        {Object.keys(studyGroups).map(s =>
                            <option key={s} value={s}>{s}</option>
                        )}
                    </select>
                }

                {Object.keys(studyGroups).length > 0 && params.sheetName &&
                    <Schedule key={params.sheetName} />
                }
            </div>
        </div>
    );
}

export default App;
