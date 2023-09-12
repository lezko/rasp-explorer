import {IStudyGroup} from 'core/IStudyGroup';
import {FC, useState} from 'react';
import {getCurrentWeekNumber} from 'core/ScheduleParser';

interface TwoWeeksProps {
    studyGroup: IStudyGroup;
}

const TwoWeeks: FC<TwoWeeksProps> = ({studyGroup}) => {
    const currentWeekNumber = getCurrentWeekNumber();
    const [weekNumber, setWeekNumber] = useState(currentWeekNumber); // todo restrict values to just two of them
    return (
        <div>

        </div>
    );
};

export default TwoWeeks;