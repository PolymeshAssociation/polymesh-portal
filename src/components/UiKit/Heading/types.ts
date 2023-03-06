export enum EHeadingTypes {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
}

export enum EHeadingCases {
  UPPER = 'uppercase',
  LOWER = 'lowercase',
  CAPITALIZE = 'capitalize',
  DEFAULT = 'default',
}

export interface IHeadingProps {
  type: EHeadingTypes;
  centered?: boolean;
  marginTop?: number;
  marginBottom?: number;
  transform: EHeadingCases;
  children: React.ReactNode;
}
