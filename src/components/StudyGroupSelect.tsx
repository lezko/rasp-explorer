import {useMemo} from 'react';
import {setParams, useSchedule} from 'store/scheduleSlice';
import {findStudyGroup, getOptionsObject, saveStudyGroupToLocalStorage} from 'utils/scheduleUtils';
import {useAppDispatch} from 'store';
import {Select} from 'antd';
import styled from 'styled-components';

const StyledSpan = styled.span`
  display: inline-block;
  width: 120px;
`;

const StyledBody = styled.div`
  & > * + * {
    margin-top: 5px;
  }
`;

const StudyGroupSelect = () => {
    const {data, loading, params} = useSchedule();
    const {sheetIndex, year, groupNumber, subgroupNumber} = params;
    const dispatch = useAppDispatch();

    const selectOptions = useMemo(() => {
        if (data && sheetIndex !== undefined) {
            // todo maybe extract to props
            return getOptionsObject(Object.values(data)[sheetIndex]);
        }
        return {};
    }, [data, sheetIndex]);

    const disabled = Object.keys(selectOptions).length === 0;
    const sheetName = data && sheetIndex ? Object.keys(data)[sheetIndex] : null;
    const groups = data && sheetName ? data[sheetName] : [];

    const yearOptions = [{value: 0, label: '-'}];
    if (disabled && year) {
        yearOptions.push({label: String(year), value: year});
    }
    if (!disabled) {
        for (const y of Object.keys(selectOptions)) {
            yearOptions.push({label: String(y), value: +y});
        }
    }

    const groupNumberOptions = [{value: 0, label: '-'}];
    if (disabled && groupNumber) {
        groupNumberOptions.push({label: String(groupNumber), value: groupNumber});
    }
    if (!disabled && year) {
        for (const gn of Object.keys(selectOptions[year])) {
            groupNumberOptions.push({label: String(gn), value: +gn});
        }
    }

    const subgroupNumberOptions = [{value: 0, label: '-'}];
    if (disabled && subgroupNumber) {
        subgroupNumberOptions.push({label: String(subgroupNumber), value: subgroupNumber});
    }
    if (!disabled && year && groupNumber) {
        for (const sgn of Object.keys(selectOptions[year][groupNumber])) {
            subgroupNumberOptions.push({label: String(sgn), value: +sgn});
        }
    }

    return (
        <StyledBody>
            <div>
                <StyledSpan>Курс:</StyledSpan>
                <Select
                    style={{width: 70}}
                    disabled={disabled}
                    value={year || 0}
                    onChange={value => {
                        dispatch(setParams({
                            year: value || undefined,
                            groupNumber: undefined,
                            subgroupNumber: undefined
                        }));
                    }}
                    options={yearOptions}
                />
            </div>

            <div>
                <StyledSpan>Группа:</StyledSpan>
                <Select
                    style={{width: 70}}
                    disabled={disabled}
                    value={groupNumber || 0}
                    onChange={value => {
                        const nextGroupNumber = value || undefined;
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
                    }}
                    options={groupNumberOptions}
                />
            </div>

            <div>
                <StyledSpan>Подгруппа:</StyledSpan>
                <Select
                    style={{width: 70}}
                    disabled={disabled || !!(year && groupNumber && Object.keys(selectOptions[year][groupNumber]).length === 0)}
                    value={subgroupNumber || 0}
                    onChange={value => {
                        const nextSubgroupNumber = value || undefined;
                        dispatch(setParams({subgroupNumber: nextSubgroupNumber}));
                        if (year && groupNumber && subgroupNumber) {
                            const studyGroup = findStudyGroup(groups, year, groupNumber, subgroupNumber);
                            if (studyGroup) {
                                saveStudyGroupToLocalStorage(studyGroup);
                            }
                        }
                    }}
                    options={subgroupNumberOptions}
                />
            </div>
        </StyledBody>
    );
};

export default StudyGroupSelect;