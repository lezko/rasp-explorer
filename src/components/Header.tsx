import styled, {useTheme} from 'styled-components';
import language from 'language.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {setSettings, Theme, useSettings} from 'store/settingsSlice';
import {faMoon, faSun} from '@fortawesome/free-solid-svg-icons';
import {useAppDispatch} from 'store';

const StyledHeader = styled.header`
  background-color: ${props => props.theme.secondaryBgColor};
  margin-bottom: 20px;
  @media (max-width: 600px) {
    margin-bottom: 10px;
  }
`;

const StyledHeaderBody = styled.div`
  padding-block: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 600px) {
    padding-block: 10px;
    font-size: .7rem;
  }
`;

const StyledIcon = styled(FontAwesomeIcon)`
  margin-left: 20px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  @media (max-width: 600px) {
    width: 20px;
    height: 20px;
    margin-left: 10px;
  }
`;

const Header = () => {
    const {theme} = useSettings();
    const styledTheme = useTheme();
    const dispatch = useAppDispatch();
    return (
        <StyledHeader>
            <div className="container">
                <StyledHeaderBody>
                    <h1>{language.title}</h1>
                    <StyledIcon
                        onClick={() => dispatch(setSettings({theme: theme === Theme.Light ? Theme.Dark : Theme.Light}))}
                        icon={theme === Theme.Light ? faMoon : faSun}
                    />
                </StyledHeaderBody>
            </div>
        </StyledHeader>
    );
};

export default Header;