import { Icon } from '~/components';
import { SkeletonLoader } from '~/components/UiKit';
import { INftListItem } from '../../constants';
import { handleImgUrlClick } from '../../helpers';
import { NftStatusLabel } from '../NftStatusLabel';
import {
  StyledNftsList,
  StyledNftCard,
  StyledNftId,
  StyledImgUrl,
  StyledNftImage,
} from './styles';

const loaderArr = [1, 2];

interface INftsListProps {
  nftList: INftListItem[];
  nftListLoading: boolean;
  handleNftClick: (nftId: number) => void;
}

export const NftsList: React.FC<INftsListProps> = ({
  nftList,
  nftListLoading,
  handleNftClick,
}) => (
  <StyledNftsList>
    {nftListLoading &&
      loaderArr.map((i) => <SkeletonLoader key={i} width={254} height={329} />)}
    {!nftListLoading &&
      nftList.map((nft) => (
        <StyledNftCard key={nft.id} onClick={() => handleNftClick(nft.id)}>
          <StyledNftImage>
            {nft.isLocked && <NftStatusLabel />}
            {nft.ticker.imgUrl ? (
              <img src={nft.ticker.imgUrl} alt={nft.ticker.imgUrl} />
            ) : (
              <Icon name="Coins" />
            )}
          </StyledNftImage>
          <StyledNftId>#{nft.id}</StyledNftId>
          <StyledImgUrl
            onClick={(e) => handleImgUrlClick(e, nft.ticker.imgUrl)}
          >
            {nft.ticker.imgUrl}
          </StyledImgUrl>
        </StyledNftCard>
      ))}
  </StyledNftsList>
);
