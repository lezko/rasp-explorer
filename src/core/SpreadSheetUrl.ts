export function getSpreadSheetUrl(id: string) {
    return `https://docs.google.com/feeds/download/spreadsheets/Export?key=${id}&exportFormat=xlsx`;
}
