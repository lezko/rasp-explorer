import {store} from 'store';
import ReactDOM from 'react-dom/client';
import 'index.css';
import App from 'App';
import {Provider} from 'react-redux';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    //<StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    //</StrictMode>
);
