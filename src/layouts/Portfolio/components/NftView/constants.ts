export enum ECollectionView {
  TABLE = 'Table',
  PALLETE = 'Pallete',
}

export interface INftListItem {
  id: number;
  ticker: {
    imgUrl: string;
  };
  isLocked: boolean;
}
