import { StyledFooter, StyledLinkList } from './styles';

const Footer = () => {
  return (
    <StyledFooter>
      <p>© 2022 Polymesh Association. All rights reserved</p>
      <StyledLinkList>
        <li>
          <a href="https://somelink.com">Terms of Service</a>
        </li>
        <li>
          <a href="https://somelink.com">Privacy Policy</a>
        </li>
      </StyledLinkList>
    </StyledFooter>
  );
};

export default Footer;
