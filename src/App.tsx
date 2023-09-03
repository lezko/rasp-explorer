import * as XLSX from 'xlsx';
import {parseWorkbook} from 'core/ScheduleParser';

function App() {
    function handleChange(e: any) {
        e.preventDefault();
        const reader = new FileReader();
        const f = e.target.files[0];
        reader.onload = async (e: any) => {
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type: 'binary'});
            const table = XLSX.utils.sheet_to_csv(wb.Sheets['Расписание (бак., спец.)']);
            parseWorkbook(wb);
            // console.log(table.split('\n'));
            // console.log(wb);
        };
        reader.readAsBinaryString(f);
    }

    return (
        <div className="App">
            <input type="file" onChange={handleChange} />
        </div>
    );
}

export default App;
