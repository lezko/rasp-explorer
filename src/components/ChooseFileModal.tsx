import {parseWorkbook, ParsingResult} from 'core/ScheduleParser';
import {FC, Fragment, useEffect, useState} from 'react';
import {Checkbox, Input, Modal} from 'antd';
import language from 'language.json';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import {resetState, setData, setParams, useSchedule} from 'store/scheduleSlice';
import {useAppDispatch} from 'store';
import {saveCacheToLocalStorage} from 'utils/cacheStorage';
import {getSpreadSheetUrl} from 'core/SpreadSheetUrl';
import {fetchSpreadSheet} from 'store/scheduleActionCreators';

const lang = language.ru;

interface ChooseFileModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onDataLoaded: (url?: string) => void;
}

enum FileAccessType {
    Url = 'Url',
    Local = 'Local',
}

const StyledTabPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

const StyledTab = styled.div<{ $active?: boolean }>`
  cursor: pointer;
  text-align: center;
  border-bottom: 3px solid;
  border-color: ${props => props.$active ? 'blue' : 'transparent'};
`;

const StyledLabel = styled.label`
  input[type="file"] {
    display: none;
  }

  padding: 5px 10px;
  border: 1px solid gray;
  border-radius: 6px;
  cursor: pointer;
`;

const StyledError = styled.span`
  display: inline-block;
  color: red;
  margin-top: 10px;
  max-height: 100px;
  overflow-y: auto;
  line-height: 1;
`;

const StyledBody = styled.div`
  padding-top: 20px;
  //display: flex;
  //justify-content: center;
`;

const ChooseFileModal: FC<ChooseFileModalProps> = ({open, setOpen, onDataLoaded}) => {
    const [fileAccessType, setFileAccessType] = useState(FileAccessType.Url);
    const [fromGssID, setFromGssID] = useState(false);

    const [fileName, setFileName] = useState('');
    const [localFileError, setLocalFileError] = useState('');
    const [wb, setWb] = useState<XLSX.WorkBook | null>(null);
    const dispatch = useAppDispatch();
    const {data, loading, error, params} = useSchedule();

    const [urlString, setUrlString] = useState(params.url || '');

    function handleFileChange(e: any) {
        e.preventDefault();
        const f = e.target.files[0];
        setLocalFileError('');
        const reader = new FileReader();
        reader.onload = async (e: any) => {
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type: 'binary'});
            setWb(wb);
            setFileName(f.name);
        };
        try {
            reader.readAsBinaryString(f);
        } catch (e: any) {
            // fixme weird error every time
            // console.error(e);
        }
    }

    function handleSubmit() {
        if (fileAccessType === FileAccessType.Local) {
            if (wb) {
                const schedules = parseWorkbook(wb);
                if (!Object.keys(schedules).length) {
                    setLocalFileError(lang.fileContentError);
                } else {
                    dispatch(resetState());
                    dispatch(setData(schedules));
                    saveCacheToLocalStorage({
                        sheetName: Object.keys(schedules)[0],
                        lastUpdateTime: Date.now()
                    });
                    setOpen(false);
                }
            }
        } else {
            let url = urlString;
            if (fromGssID) {
                url = getSpreadSheetUrl(urlString);
                setFromGssID(false);
            }
            if (url !== params.url) {
                dispatch(resetState());
            }
            dispatch(fetchSpreadSheet(url)).unwrap()
                .then((data) => {
                    // fixme sync with state
                    dispatch(setParams({sheetIndex: 0}));
                    saveCacheToLocalStorage({lastUpdateTime: Date.now(), sheetName: Object.keys(data)[0]});
                    onDataLoaded(url);
                    setOpen(false);
                })
                .catch(e => {

                });
            setUrlString(url);
        }
    }

    return (
        <Modal
            open={open}
            title={lang.chooseFile}
            okButtonProps={{
                disabled: (fileAccessType === FileAccessType.Local && !fileName) || (fileAccessType === FileAccessType.Url && !urlString),
                loading,
                type: 'default'
            }}
            onOk={handleSubmit}
            closable
            onCancel={() => setOpen(false)}
        >
            <div style={{marginTop: 20}}>
                <StyledTabPanel>
                    <StyledTab
                        onClick={() => setFileAccessType(FileAccessType.Url)}
                        $active={(fileAccessType === FileAccessType.Url)}
                    >{lang.fileSelect.url}
                    </StyledTab>
                    <StyledTab
                        onClick={() => setFileAccessType(FileAccessType.Local)}
                        $active={(fileAccessType === FileAccessType.Local)}
                    >{lang.fileSelect.local}
                    </StyledTab>
                </StyledTabPanel>

                <StyledBody>
                    {fileAccessType === FileAccessType.Local ?
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <span style={{fontSize: '.7rem', marginBottom: 5}}>{fileName}</span>
                            <StyledLabel>
                                {lang.chooseFileLabel}
                                <input type="file" accept=".xlsx" onChange={handleFileChange} />
                            </StyledLabel>
                        </div> :
                        <div>
                            <label style={{display: 'inline-block', marginBottom: 10}}>
                                <Checkbox
                                    style={{marginRight: 5}}
                                    checked={fromGssID}
                                    onChange={e => setFromGssID(e.target.checked)}
                                />
                                {lang.constructUrlFromGssID}
                            </label>
                            <Input
                                placeholder={fromGssID ? lang.enterGssID : lang.enterUrl}
                                value={urlString}
                                onChange={e => setUrlString(e.target.value)}
                            />
                        </div>
                    }
                    {fileAccessType === FileAccessType.Local && localFileError &&
                        <StyledError>{lang.error}: {localFileError}</StyledError>}
                    {fileAccessType === FileAccessType.Url && error && <StyledError>{lang.error}: {error}</StyledError>}
                </StyledBody>
            </div>
        </Modal>
    );
};

export default ChooseFileModal;