import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useAppSelector} from 'store/index';

export enum Theme {
    Light = 'Light',
    Dark = 'Dark',
}

export interface SettingsState {
    theme: Theme;
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

let initialState = getSettingsFromLocalStorage();
if (!initialState) {
    initialState = {
        theme: Theme.Light,
    }
    saveSettingsToLocalStorage(initialState);
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings(state, action: PayloadAction<SettingsState>) {
            saveSettingsToLocalStorage(action.payload);
            return action.payload;
        },
    }
});

export const {setSettings} = settingsSlice.actions;
export default settingsSlice.reducer;

export function useSettings(): SettingsState {
    return useAppSelector(state => state.settings);
}