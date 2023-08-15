import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-area: era-info;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 24px;
  gap: 10px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;

  @media screen and (max-width: 1200px) {
    width: 100%;
  }
`;

export const DetailsContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

export const Label = styled.span`
  display: inline-block;
  font-weight: bold;
  min-width: 120px;
`;

export const Value = styled.span`
  display: inline-block;
  text-align: left;
`;
