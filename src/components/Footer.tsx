import styled, {useTheme} from 'styled-components';
import language from 'language.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {faGithub} from '@fortawesome/free-brands-svg-icons';

const StyledFooter = styled.footer`
  background-color: ${props => props.theme.secondaryBgColor};
  margin-top: 30px;
  @media (max-width: 600px) {
    margin-top: 15px;
  }
`;

const StyledFooterBody = styled.div`
  padding-block: 30px;
  font-size: .9rem;
  @media (max-width: 600px) {
    padding-block: 15px;
  }
`;

const StyledIconsBlock = styled.div`
  margin-left: 5px;
  & > * + * {
    margin-left: 10px;
  }
`;

const StyledIcon = styled(FontAwesomeIcon)`
  //cursor: pointer;
  width: 20px;
  height: 20px;
`;

const StyledLink = styled.a`
  text-decoration: none;
  border-bottom: 1px dotted;
`;

const Footer = () => {
    const theme = useTheme();
    return (
        <StyledFooter>
            <div className="container">
                <StyledFooterBody>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {language.title} &#x2022; Created by Lezko &#x2022; <StyledIconsBlock>
                        <a target="_blank" href={language.githubUrl}><StyledIcon icon={faGithub} /></a>
                        <a href={'mailto:' + language.email}><StyledIcon icon={faEnvelope} /></a>
                    </StyledIconsBlock>
                    </div>
                    <div style={{textAlign: 'center', marginTop: 5}}>
                        <StyledLink target="_blank" style={{}} href={language.repoUrl}>Github Project</StyledLink>
                    </div>
                </StyledFooterBody>
            </div>
        </StyledFooter>
    );
};

export default Footer;