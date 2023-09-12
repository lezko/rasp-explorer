import * as XLSX from 'xlsx';
import {parseWorkbook} from 'core/ScheduleParser';
import {ChangeEvent, useEffect, useState} from 'react';
import Schedule from 'components/Schedule';
import {getSpreadSheetUrl} from 'core/SpreadSheetUrl';
import {useAppDispatch} from 'store';
import {
    parseScheduleParams, ScheduleParamsState,
    setScheduleParams,
    setScheduleParamsFromString,
    useScheduleParams
} from 'store/scheduleParamsSlice';

function App() {
    const [fileAccessType, setFileAccessType] = useState<'local' | 'url' | 'id'>('local');
    const [schedules, setSchedules] = useState<ReturnType<typeof parseWorkbook>>();
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [lastUrl, setLastUrl] = useState('');

    // origin
    const dispatch = useAppDispatch();
    const params = useScheduleParams();
    useEffect(() => {
        const searchString = window.location.search;
        if (searchString) {
            const urlParams = parseScheduleParams(searchString);
            dispatch(setScheduleParams(urlParams));
            if (urlParams.sheetName) {
                setSelectedSchedule(urlParams.sheetName);
            }
            if (urlParams.url) {
                getFileByUrl(urlParams.url);
                setFileAccessType('url');
                setUrlString(urlParams.url);
            }
            window.history.replaceState(null, document.title, window.location.origin);
        }
    }, []);

    function getFileByUrl(url: string) {
        fetch(url).then(res => res.arrayBuffer()).then(data => {
            const wb = XLSX.read(data, {type: 'binary'});
            const schedules = parseWorkbook(wb);
            setSchedules(schedules);
            if (!params.sheetName) {
                const sheetName = Object.keys(schedules)[0];
                setSelectedSchedule(sheetName);
                dispatch(setScheduleParams({sheetName}));
            }
            setLastUrl(url);
        });
    }

    function handleChange(e: any) {
        e.preventDefault();
        const reader = new FileReader();
        setLastUrl('');
        const f = e.target.files[0];
        reader.onload = async (e: any) => {
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type: 'binary'});
            const schedules = parseWorkbook(wb);
            setSchedules(schedules);
            setSelectedSchedule(Object.keys(schedules)[0]);
        };
        reader.readAsBinaryString(f);
    }

    function handleSelectedScheduleChange(e: ChangeEvent<HTMLSelectElement>) {
        const sheetName = e.target.value;
        setSelectedSchedule(sheetName);
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

    const [urlString, setUrlString] = useState('');
    const [gshIdString, setGshIdString] = useState('');

    return (
        <div className="app">
            <div className="container">
                <div style={{marginBottom: 20}}>
                    <div>
                        <div>Получить файл с помощью:</div>
                        {/* fixme */}
                        {/*@ts-ignore*/}
                        <select style={{marginBottom: 5}} value={fileAccessType} onChange={e => setFileAccessType(e.target.value)}>
                            <option value="local">Локальный файл</option>
                            <option value="url">URL</option>
                            <option value="id">Google SpreadSheet ID</option>
                        </select>
                    </div>
                    {fileAccessType === 'local' ? <input type="file" onChange={handleChange} /> :
                        fileAccessType === 'url' ?
                            <div>
                                <input type="text" value={urlString} onChange={e => setUrlString(e.target.value)} />
                                <button style={{marginLeft: 5}} onClick={() => getFileByUrl(urlString)}>OK</button>
                            </div>
                            :
                            <div>
                                <input type="text" value={gshIdString} onChange={e => setGshIdString(e.target.value)} />
                                <button style={{marginLeft: 5}}
                                        onClick={() => getFileByUrl(getSpreadSheetUrl(gshIdString))}>OK
                                </button>
                            </div>
                    }
                </div>
                {lastUrl && <button style={{marginBottom: 30}} onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}?url=${lastUrl}`);
                }}>Скопировать публичную ссылку</button>}
                <br />

                {schedules &&
                    <select style={{marginBottom: 10}} onChange={handleSelectedScheduleChange} value={selectedSchedule}>
                        {Object.keys(schedules).map(s =>
                            <option key={s} value={s}>{s}</option>
                        )}
                    </select>
                }

                {schedules && selectedSchedule &&
                    <Schedule key={selectedSchedule} groups={schedules[selectedSchedule]} />
                }
            </div>
        </div>
    );
}

export default App;
