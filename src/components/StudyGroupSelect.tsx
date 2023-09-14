import {useMemo} from 'react';
import {setParams, useSchedule} from 'store/scheduleSlice';
import {findStudyGroup, getOptionsObject, saveStudyGroupToLocalStorage} from 'utils/scheduleUtils';
import {useAppDispatch} from 'store';

const StudyGroupSelect = () => {
    const {data, loading, params} = useSchedule();
    const {sheetName, year, groupNumber, subgroupNumber} = params;
    const dispatch = useAppDispatch();

    const selectOptions = useMemo(() => {
        if (Object.keys(data).length && sheetName) {
            // todo maybe extract to props
            return getOptionsObject(data[sheetName]);
        }
        return {};
    }, [data, sheetName]);

    const disabled = Object.keys(selectOptions).length === 0;
    const groups = Object.keys(data).length > 0 && sheetName ? data[sheetName] : [];

    return (
        <div>
            <span>Курс:</span>
            <select disabled={disabled} value={String(year) || ''} onChange={e => {
                dispatch(setParams({
                    year: +e.target.value || undefined,
                    groupNumber: undefined,
                    subgroupNumber: undefined
                }));
            }}>
                <option value=""></option>
                {!disabled && Object.keys(selectOptions).map(y =>
                    <option key={y} value={String(y)}>{y}</option>
                )}
            </select>
            <br />

            <span>Группа:</span>
            <select disabled={disabled} value={String(groupNumber) || ''} onChange={e => {
                const nextGroupNumber = +e.target.value || undefined;
                dispatch(setParams({
                    groupNumber: nextGroupNumber,
                    subgroupNumber: undefined,
                }));
                if (year && groupNumber) {
                    const studyGroup = findStudyGroup(groups, year, groupNumber, undefined);
                    if (studyGroup) {
                        saveStudyGroupToLocalStorage(studyGroup);
                    }
                }
            }}>
                <option value=""></option>
                {!disabled && year && Object.keys(selectOptions[year]).map((gn, i) =>
                    <option key={i} value={gn}>{gn}</option>
                )}
            </select>
            <br />

            <span>Подгруппа:</span>
            <select
                disabled={disabled || !!(year && groupNumber && Object.keys(selectOptions[year][groupNumber]).length === 0)}
                value={String(subgroupNumber) || ''}
                onChange={e => {
                    const nextSubgroupNumber = +e.target.value || undefined;
                    dispatch(setParams({subgroupNumber: nextSubgroupNumber}));
                    if (year && groupNumber && subgroupNumber) {
                        const studyGroup = findStudyGroup(groups, year, groupNumber, subgroupNumber);
                        if (studyGroup) {
                            saveStudyGroupToLocalStorage(studyGroup);
                        }
                    }
                }}
            >
                <option value=""></option>
                {!disabled && year && groupNumber && Object.keys(selectOptions[year][groupNumber]).map((sgn, i) =>
                    <option key={i} value={sgn}>{sgn}</option>
                )}
            </select>
            <br />
        </div>
    );
};

export default StudyGroupSelect;