import {ILesson, lessonScheduleTime} from 'core/ISchedule';
import {FC} from 'react';
import styled from 'styled-components';

interface LessonProps {
    time: typeof lessonScheduleTime[number];
    lesson?: ILesson;
}

const StyledLesson = styled.div`
  padding-block: 5px;
  display: flex;
`;

const StyledTime = styled.div`
  flex: 0 0 50px;
  font-size: .9rem;
  border-right: 2px solid ${props => props.theme.color};
  display: flex;
  flex-direction: column;
`;

const StyledDescription = styled.div`
  padding-left: 10px;
`;

const Lesson: FC<LessonProps> = ({lesson, time}) => {
    return (
        <StyledLesson>
            <StyledTime>
                <span>{time[0]}</span>
                <span>{time[1]}</span>
            </StyledTime>
            <StyledDescription>
                {lesson?.description}
            </StyledDescription>
        </StyledLesson>
    );
};

export default Lesson;