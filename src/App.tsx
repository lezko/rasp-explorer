import {ChangeEvent, useEffect} from 'react';
import Schedule from 'components/Schedule';
import {useAppDispatch} from 'store';
import FileSelect from 'components/FileSelect';
import {fetchSpreadSheet} from 'store/scheduleActionCreators';
import {parseScheduleParams, ScheduleParams, scheduleParamsToUrl, setParams, useSchedule} from 'store/scheduleSlice';
import {removeStudyGroupFromLocalStorage} from 'utils/scheduleUtils';

function App() {
    const dispatch = useAppDispatch();
    const {params} = useSchedule();
    const {error, loading, data} = useSchedule();
    useEffect(() => {
        const searchString = window.location.search;
        let url = params.url;
        if (searchString) {
            const urlParams = parseScheduleParams(searchString);
            if (urlParams.url) {
                url = urlParams.url;
            }
            if (
                (urlParams.url && urlParams.url !== params.url) || (urlParams.sheetName && urlParams.sheetName !== params.sheetName)
            ) {
                removeStudyGroupFromLocalStorage();
            }
            dispatch(setParams(urlParams));
        }
        if (url) {
            dispatch(fetchSpreadSheet(url));
        }
    }, []);

    // fixme
    useEffect(() => {
        if (Object.keys(data).length && !params.sheetName) {
            dispatch(setParams({sheetName: Object.keys(data)[0]}));
        }
    }, [data]);

    function handleSelectedScheduleChange(e: ChangeEvent<HTMLSelectElement>) {
        const sheetName = e.target.value;
        const nextParams = {
            sheetName
        } as ScheduleParams;
        if (sheetName !== params.sheetName) {
            nextParams.year = undefined;
            nextParams.groupNumber = undefined;
            nextParams.subgroupNumber = undefined;
        }
        dispatch(setParams(nextParams));
    }

    return (
        <div className="app">
            <center style={{marginBottom: 30}}>DEV</center>
            <div className="container">
                <button
                    style={{marginBlock: 10}}
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + window.location.pathname + scheduleParamsToUrl(params));
                    }}
                >
                    Поделиться расписанием
                </button>
                <br/>

                <FileSelect />

                {data &&
                    <select
                        style={{marginBlock: 10}}
                        onChange={handleSelectedScheduleChange}
                        value={params.sheetName}
                    >
                        {Object.keys(data).map(s =>
                            <option key={s} value={s}>{s}</option>
                        )}
                    </select>
                }

                <Schedule />
            </div>
        </div>
    );
}

export default App;
