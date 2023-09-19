import {store} from 'store';
import ReactDOM from 'react-dom/client';
import 'index.css';
import App from 'App';
import {Provider} from 'react-redux';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const firebaseConfig = {
    apiKey: "AIzaSyA1BnLwbnBKMsz1mcgePnqKezyvRav1GuY",
    authDomain: "lezko-rasp-explorer.firebaseapp.com",
    projectId: "lezko-rasp-explorer",
    storageBucket: "lezko-rasp-explorer.appspot.com",
    messagingSenderId: "697305144556",
    appId: "1:697305144556:web:c63143ebebf24e86b459c9",
    measurementId: "G-MH48N376C6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

root.render(
    //<StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    //</StrictMode>
);
