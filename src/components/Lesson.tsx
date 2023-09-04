import {ILesson, lessonScheduleTime} from 'core/ISchedule';
import {FC} from 'react';
import styles from 'scss/components/Lesson.module.scss'

interface LessonProps {
    time: typeof lessonScheduleTime[number];
    lesson?: ILesson;
}

const Lesson: FC<LessonProps> = ({lesson, time}) => {
    return (
        <div className={styles.lesson}>
            <div className={styles.time}>
                <span>{time[0]}</span>
                <span>{time[1]}</span>
            </div>
            <div className={styles.description}>
                {lesson?.description}
            </div>
        </div>
    );
};

export default Lesson;