import styled from 'styled-components';

export const ModalTitle = styled.h2`
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 500;
`;

export const ModalDescription = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
  color: inherit;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

export const StyledPageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 12px;

  @media screen and (max-width: 767px) {
    margin-bottom: 18px;
    padding: 0 8px;
  }
`;

export const StyledSecondaryKeysList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 36px;

  @media screen and (max-width: 767px) {
    gap: 24px;
  }
`;
