import {ChangeEvent} from 'react';

function App() {
    function handleChange(e: any) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = async (e) => {
            let text = e.target?.result as string;
            text = text.replaceAll('\r\n', '\n');
            let textArr = text.split('\n');

            console.log(textArr);
        };
        reader.readAsText(e.target.files[0]);

    }

    return (
        <div className="App">
            <input type="file" onChange={handleChange} />
        </div>
    );
}

export default App;
