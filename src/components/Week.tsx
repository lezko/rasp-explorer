import {DayName, IWeek} from 'core/ISchedule';
import {FC} from 'react';
import Day from 'components/Day';
import styled from 'styled-components';

interface WeekProps {
    week: IWeek;
}

const StyledWeek = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  grid-template-areas:
  "monday thursday"
  "tuesday friday"
  "wednesday saturday";

  & > *:nth-child(1) {grid-area: monday}
  & > *:nth-child(2) {grid-area: tuesday}
  & > *:nth-child(3) {grid-area: wednesday}
  & > *:nth-child(4) {grid-area: thursday}
  & > *:nth-child(5) {grid-area: friday}
  & > *:nth-child(6) {grid-area: saturday}

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    grid-template-areas: initial;
    & > * {
      grid-area: unset !important;
    }
  }
`;

const Week: FC<WeekProps> = ({week}) => {
    return (
        <StyledWeek>
            {week.map((d, i) =>
                <li key={i}>
                    <Day day={d} name={DayName[i]} />
                </li>
            )}
        </StyledWeek>
    );
};

export default Week;