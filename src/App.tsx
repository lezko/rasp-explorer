import {useEffect, useState} from 'react';
import Schedule from 'components/Schedule';
import {useAppDispatch} from 'store';
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
import {Button, ConfigProvider, Modal, Select} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faLink} from '@fortawesome/free-solid-svg-icons';
import language from 'language.json';
import ChooseFileModal from 'components/ChooseFileModal';
import {getCacheFromLocalStorage, saveCacheToLocalStorage} from 'utils/cacheStorage';
import Header from 'components/Header';
import styled, {createGlobalStyle, ThemeProvider} from 'styled-components';
import {Theme, useSettings} from 'store/settingsSlice';
import Footer from 'components/Footer';

// todo lang setting
const lang = language.ru;

interface ITheme {
    color: string;
    bgColor: string;
    borderColor: string
    hoverColor: string;
    bgHoverColor: string;
    bgActiveColor: string;
    placeholderColor: string;
    secondaryBgColor: string;
}

// fixme absolute cringe
const themes = {
    [Theme.Light]: {
        color: 'black',
        bgColor: 'white',
        borderColor: '#dec9c9',
        hoverColor: 'black',
        bgHoverColor: '#d5d5d5',
        bgActiveColor: '#a2a2a2',
        placeholderColor: '#969696',
        secondaryBgColor: '#e6e6e6'
    } as ITheme,
    [Theme.Dark]: {
        color: '#bbb7b0',
        bgColor: '#2d2d2d',
        borderColor: '#595854',
        hoverColor: '#bbb7b0',
        bgHoverColor: '#3f3e3e',
        bgActiveColor: '#5b5b5b',
        placeholderColor: '#5b5857',
        secondaryBgColor: '#232221'
    } as ITheme
};

const GlobalStyle = createGlobalStyle`
  body {
    color: ${props => props.theme.color};
    background-color: ${props => props.theme.bgColor};
  }
`;

const StyledAppMain = styled.main`
  flex: 1;
`;

function App() {
    const dispatch = useAppDispatch();
    const {params} = useSchedule();
    const {error, loading, data} = useSchedule();
    const cache = getCacheFromLocalStorage();
    const {theme} = useSettings();
    const [{error: modalError}, contextHolder] = Modal.useModal()

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
                    saveCacheToLocalStorage({lastUpdateTime: Date.now()});
                })
                .catch(message => {
                    modalError({
                        closable: true,
                        title: lang.error,
                        content: <div style={{maxHeight: 100, overflowY: 'auto'}}>
                            {message}
                        </div>,
                        okButtonProps: {type: 'default'}
                    })
                });
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

    const currentTheme = themes[theme];
    return (
        <ThemeProvider theme={currentTheme}>
            <GlobalStyle />

            <ConfigProvider theme={{
                token: {
                    colorText: currentTheme.color,
                    colorBgBase: currentTheme.bgColor,
                    colorBorder: currentTheme.borderColor,
                    colorPrimaryHover: currentTheme.hoverColor,
                    colorIcon: currentTheme.color,
                    colorTextDisabled: 'gray',
                    colorTextPlaceholder: currentTheme.placeholderColor
                },
                components: {
                    Select: {
                        controlItemBgHover: currentTheme.bgHoverColor,
                        controlItemBgActive: currentTheme.bgActiveColor,

                    }
                }
            }}>
                {contextHolder}

                <div className="app">
                    <Header />

                    <StyledAppMain>
                        <ChooseFileModal open={modalOpen} setOpen={setModalOpen} onDataLoaded={url => {
                            dispatch(setParams({url}));
                        }} />

                        <div className="container">
                            <div style={{display: 'flex'}}>
                                {/* fixme bug when switching from local to url */}
                                {params.url && !loading &&
                                    <Button
                                        style={{marginRight: 10}}
                                        onClick={handleShare}
                                    >
                                        {shareBtnText} <FontAwesomeIcon style={{marginLeft: 5}} icon={faLink} />
                                    </Button>
                                }

                                {(data || params.url) && !loading ?
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
                    </StyledAppMain>

                    <Footer />
                </div>
            </ConfigProvider>
        </ThemeProvider>
    );
}

export default App;
