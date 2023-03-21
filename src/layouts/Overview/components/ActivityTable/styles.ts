import styled from 'styled-components';

export const StatusLabel = styled.div<{ success: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82px;
  height: 24px;
  border-radius: 100px;
  font-weight: 500;
  font-size: 12px;
  ${({ success }) =>
    success
      ? `
        background-color: #d4f7e7;
        color: #00aa5e;`
      : `
        background-color: #FAE6E8;
        color: #DB2C3E;
      `}
`;

export const IdCellWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #fbfbfb;
  color: #727272;
`;
