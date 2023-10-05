import { StyledInfoItemPink } from '../styles';

export const ModuleCell = ({ module }: { module: string }) => (
  <StyledInfoItemPink className="capitalize">{module}</StyledInfoItemPink>
);
