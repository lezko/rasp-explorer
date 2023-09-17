import {ChangeEvent, useEffect, useState} from 'react';
import Schedule from 'components/Schedule';
import {useAppDispatch} from 'store';
import FileSelect from 'components/FileSelect';
import {fetchSpreadSheet} from 'store/scheduleActionCreators';
import {
    parseScheduleParams,
    resetState,
    ScheduleParams,
    scheduleParamsToUrl,
    setParams,
    useSchedule
} from 'store/scheduleSlice';
import {removeStudyGroupFromLocalStorage} from 'utils/scheduleUtils';
import {Button, Select} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faLink} from '@fortawesome/free-solid-svg-icons';
import language from 'language.json';
import ChooseFileModal from 'components/ChooseFileModal';
import {getCacheFromLocalStorage, saveCacheToLocalStorage} from 'utils/cacheStorage';

// todo lang setting
const lang = language.ru;

function App() {
    const dispatch = useAppDispatch();
    const {params} = useSchedule();
    const {error, loading, data} = useSchedule();
    const cache = getCacheFromLocalStorage();
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
            dispatch(fetchSpreadSheet(url)).unwrap()
                .then(() => {
                    saveCacheToLocalStorage({lastUpdateTime: Date.now()})
                })
                .catch(e => {});
        } else {
            dispatch(resetState());
        }
    }, []);

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
        dispatch(setParams(nextParams));
    }

    const [shareBtnText, setShareBtnText] = useState(lang.share);

    function handleShare() {
        navigator.clipboard.writeText(window.location.origin + window.location.pathname + scheduleParamsToUrl(params));
        setShareBtnText(lang.linkCopied);
        setTimeout(() => setShareBtnText(lang.share), 5000);
    }

    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="app">
            <ChooseFileModal open={modalOpen} setOpen={setModalOpen} onDataLoaded={url => {
                dispatch(setParams({url}));
            }} />

            <center style={{marginBottom: 30}}>DEV</center>
            <div className="container">
                <div style={{display: 'flex'}}>
                    {params.url && data &&
                        <Button
                            style={{marginRight: 10}}
                            onClick={handleShare}
                        >
                            {shareBtnText} <FontAwesomeIcon style={{marginLeft: 5}} icon={faLink} />
                        </Button>
                    }

                    {data && !loading ?
                        <div>
                            <Button onClick={() => setModalOpen(true)}>{lang.changeFile}</Button>
                        </div>
                        : (!loading && <Button onClick={() => setModalOpen(true)}>{lang.chooseFile}</Button>)
                    }
                </div>

                {data &&
                    <Select
                        disabled={Object.keys(data).length === 0}
                        style={{marginBlock: 10, width: 250}}
                        onChange={handleSelectedScheduleChange}
                        value={params.sheetIndex}
                        options={sheetNames.map((s, i) => ({
                            value: i, label: s
                        }))}
                    />
                }

                <Schedule />
            </div>
        </div>
    );
}

export default App;
