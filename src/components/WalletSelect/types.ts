export enum ESelectPlacements {
  HEADER = 'header',
  WIDGET = 'widget',
}

export interface ISelectProps {
  placement?: `${ESelectPlacements}`;
}
