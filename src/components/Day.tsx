import {DayName, IDay, ILesson, lessonCount, lessonScheduleTime} from 'core/ISchedule';
import {FC} from 'react';
import Lesson from 'components/Lesson';
import styles from 'scss/components/Day.module.scss';

interface DayProps {
    name: string;
    day: IDay;
}

const Day: FC<DayProps> = ({day, name}) => {
    const lessons = Array(lessonCount).fill(null);
    for (const lesson of day) {
        lessons[lessonScheduleTime.indexOf(lesson.time)] = lesson;
    }
    let stopIdx = -1;
    for (let i = 0; i < lessonCount; i++) {
        if (lessons[i]) {
            stopIdx = i;
        }
    }
    lessons.length = stopIdx + 1;
    return (
        <div className={styles.day}>
            <div className={styles.name}>{name}</div>
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