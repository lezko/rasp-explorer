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
                (urlParams.url && urlParams.url !== params.url) || (urlParams.sheetIndex && urlParams.sheetIndex !== params.sheetIndex)
            ) {
                removeStudyGroupFromLocalStorage();
            }
            dispatch(setParams(urlParams));
        }
        if (url) {
            dispatch(fetchSpreadSheet(url));
        }
    }, []);

    const sheetNames = Object.keys(data);

    function handleSelectedScheduleChange(e: ChangeEvent<HTMLSelectElement>) {
        const sheetIndex = +e.target.value;
        const nextParams = {
            sheetIndex
        } as ScheduleParams;
        if (sheetIndex !== params.sheetIndex) {
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
                        disabled={Object.keys(data).length === 0}
                        style={{marginBlock: 10}}
                        onChange={handleSelectedScheduleChange}
                        value={params.sheetIndex}
                    >
                        {sheetNames.map((s, i) =>
                            <option key={s} value={i}>{s}</option>
                        )}
                    </select>
                }

                <Schedule />
            </div>
        </div>
    );
}

export default App;
