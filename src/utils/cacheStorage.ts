export interface Cache {
    sheetName: string;
    // fileName: string;
    lastUpdateTime: number;
}

export function getCacheFromLocalStorage(): Cache | null {
    const cacheString = localStorage.getItem('cache');
    if (cacheString) {
        return JSON.parse(cacheString);
    }
    return null;
}

export function saveCacheToLocalStorage(cache: Partial<Cache>) {
    const oldCache = getCacheFromLocalStorage();
    if (oldCache) {
        localStorage.setItem('cache', JSON.stringify({...oldCache, ...cache}));
    } else {
        localStorage.setItem('cache', JSON.stringify(cache));
    }
}

export function setPartialCacheToLocalStorage(partialCache: Partial<Cache>) {
    const oldCache = getCacheFromLocalStorage();
    const newCache = oldCache ? {...oldCache, ...partialCache} : partialCache;
    saveCacheToLocalStorage(newCache as Cache);
}