import {faCircleNotch} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import styled, {keyframes} from 'styled-components';

const SpinnerIcon = (props: any) => <FontAwesomeIcon {...props} icon={faCircleNotch} />;

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled(SpinnerIcon)`
  animation: ${rotateAnimation} 1s linear infinite;
`;

export default Spinner;