import * as XLSX from 'xlsx';

function App() {
    function handleChange(e: any) {
        e.preventDefault();
        const reader = new FileReader();
        const f = e.target.files[0];
        reader.onload = async (e: any) => {
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type: 'binary'});
            console.log(wb);
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
