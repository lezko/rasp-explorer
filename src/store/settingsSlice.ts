import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useAppSelector} from 'store/index';

export enum Theme {
    Light = 'Light',
    Dark = 'Dark',
}

export interface SettingsState {
    theme: Theme;
    showSpecialization: boolean;
}

function getSettingsFromLocalStorage(): SettingsState | null {
    const settingsString = localStorage.getItem('settings');
    if (settingsString) {
        return JSON.parse(settingsString);
    }
    return null;
}

function saveSettingsToLocalStorage(settings: SettingsState) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

const initialSettings = {
    theme: Theme.Light,
    showSpecialization: true,
};
let initialState = getSettingsFromLocalStorage();
if (!initialState) {
    initialState = initialSettings;
} else {
    initialState = {...initialSettings, ...initialState};
}
saveSettingsToLocalStorage(initialState);

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings(state, action: PayloadAction<Partial<SettingsState>>) {
            const settings = {...state, ...action.payload};
            saveSettingsToLocalStorage(settings);
            return settings;
        },
    }
});

export const {setSettings} = settingsSlice.actions;
export default settingsSlice.reducer;

export function useSettings(): SettingsState {
    return useAppSelector(state => state.settings);
}