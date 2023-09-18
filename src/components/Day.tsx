import {IDay, lessonCount, lessonScheduleTime} from 'core/ISchedule';
import {FC} from 'react';
import Lesson from 'components/Lesson';
import styled from 'styled-components';

interface DayProps {
    name: string;
    day: IDay;
}

const StyledDayName = styled.div`
  font-size: 1.2rem;
  line-height: 1.5;
  border-bottom: 3px solid ${props => props.theme.color};
  font-weight: 700;
  margin-bottom: 10px;
`;

const Day: FC<DayProps> = ({day, name}) => {
    const lessons = Array(lessonCount).fill(null);
    for (const lesson of day) {
        lessons[lessonScheduleTime.findIndex(t => t[0] === lesson.time[0] && t[1] === lesson.time[1])] = lesson;
    }
    let stopIdx = -1;
    for (let i = 0; i < lessonCount; i++) {
        if (lessons[i]) {
            stopIdx = i;
        }
    }
    lessons.length = stopIdx + 1;
    return (
        <div>
            <StyledDayName>{name}</StyledDayName>
            <ul>
                {lessons.map((l, i) =>
                    <li key={i}>
                        <Lesson lesson={l} time={lessonScheduleTime[i]} />
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Day;