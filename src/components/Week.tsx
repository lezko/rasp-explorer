import {DayName, IWeek} from 'core/ISchedule';
import {FC} from 'react';
import Day from 'components/Day';
import styles from 'scss/components/Week.module.scss';

interface WeekProps {
    week: IWeek;
}

const Week: FC<WeekProps> = ({week}) => {
    return (
        <ul className={styles.week}>
            {week.map((d, i) =>
                <li key={i}>
                    <Day day={d} name={DayName[i]} />
                </li>
            )}
        </ul>
    );
};

export default Week;