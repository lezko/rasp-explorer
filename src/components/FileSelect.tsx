import {parseWorkbook} from 'core/ScheduleParser';
import {FC, useEffect, useState} from 'react';
import * as XLSX from 'xlsx';
import styled from 'styled-components';
import language from 'language.json';
import {getSpreadSheetUrl} from 'core/SpreadSheetUrl';
import {getSpreadSheetByUrl} from 'utils/fetchData';
import {useScheduleParams} from 'store/scheduleParamsSlice';

// todo language setting
const lang = language.ru.fileSelect;

const StyledList = styled.ul`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledTab = styled.li`
  cursor: pointer;
  padding: 5px 10px;
  font-size: .9rem;
`;

const StyledBody = styled.div`
  height: 70px;
  display: grid;
  place-content: center;
`;

const StyledFileSelect = styled.div`
  border: 1px solid black;
  max-width: 450px;
`;

interface FileSelectProps {
    onFileLoaded: (data: ReturnType<typeof parseWorkbook>) => void;
}

const FileSelect: FC<FileSelectProps> = ({onFileLoaded}) => {
    const [fileAccessType, setFileAccessType] = useState<'local' | 'url' | 'gssID'>('gssID');
    const [urlString, setUrlString] = useState('');
    const [gssIDString, setGssIDString] = useState('');

    const params = useScheduleParams();

    useEffect(() => {
        if (params.url && !urlString) {
            setUrlString(params.url);
            setFileAccessType('url');
        }
    }, [params])

    function handleFileInputChange(e: any) {
        e.preventDefault();
        const reader = new FileReader();
        const f = e.target.files[0];
        reader.onload = async (e: any) => {
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type: 'binary'});
            const schedules = parseWorkbook(wb);
            onFileLoaded(schedules);
        };
        reader.readAsBinaryString(f);
    }

    const fileAccessOptions = ['gssID', 'url', 'local'];
    const fileAccessLabels: { [key: string]: string } = {
        local: lang.local,
        url: lang.url,
        gssID: lang.gssID
    };

    return (
        <StyledFileSelect>
            <StyledList>{fileAccessOptions.map(o =>
                <StyledTab
                    style={{background: o === fileAccessType ? 'lightgray' : 'inherit'}}
                    key={o}
                    onClick={() => setFileAccessType(o as typeof fileAccessType)}
                >{fileAccessLabels[o]}</StyledTab>
            )}</StyledList>
            <StyledBody>{
                fileAccessType === 'local' ?
                    <input type="file" onChange={handleFileInputChange} /> : fileAccessType === 'url' ?
                        <div>
                            <input type="text" value={urlString} onChange={e => setUrlString(e.target.value)} />
                            <button style={{marginLeft: 5}} onClick={() => {
                                getSpreadSheetByUrl(urlString).then(onFileLoaded);
                            }}>OK
                            </button>
                        </div> :
                        <div>
                            <input type="text" value={gssIDString} onChange={e => setGssIDString(e.target.value)} />
                            <button style={{marginLeft: 5}}
                                    onClick={() => {
                                        getSpreadSheetByUrl(getSpreadSheetUrl(gssIDString)).then(onFileLoaded);
                                    }}>OK
                            </button>
                        </div>


            }</StyledBody>
        </StyledFileSelect>
    );
};

export default FileSelect;