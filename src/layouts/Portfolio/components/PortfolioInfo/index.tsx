import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { AccountContext } from '~/context/AccountContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { usePortfolio } from '~/hooks/polymesh';
import { CopyToClipboard, Icon } from '~/components';
import { Button, Heading, SkeletonLoader } from '~/components/UiKit';
import { PortfolioModal } from '../PortfolioModal';
import {
  StyledWrapper,
  StyledTopInfo,
  IconWrapper,
  StyledPortfolioInfo,
  StyledDetails,
  StyledButtonWrapper,
  StyledDeleteButton,
} from './styles';
import { formatDid } from '~/helpers/formatters';
import { MoveAssets } from '../MoveAssets';
import { useWindowWidth } from '~/hooks/utility';

export const PortfolioInfo = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<IPortfolioData>();
  const { identity, identityHasValidCdd, isExternalConnection } =
    useContext(AccountContext);
  const { allPortfolios, portfolioLoading } = useContext(PortfolioContext);
  const { deletePortfolio, actionInProgress } = usePortfolio(
    selectedPortfolio?.portfolio,
  );
  const [editExpanded, setEditExpanded] = useState(false);
  const [moveExpanded, setMoveExpanded] = useState(false);
  const [searchParams] = useSearchParams();
  const [nfts, setNfts] = useState(0);
  const id = searchParams.get('id');
  const notDefaultPortfolio = !!id && id !== 'default';
  const { isMobile, isSmallDesktop } = useWindowWidth();

  useEffect(() => {
    if (!id) return;

    setNfts(0);

    const current = allPortfolios.find((portfolio) => portfolio.id === id);
    if (current) {
      setSelectedPortfolio(current);
      (async () => {
        const collections = await current.portfolio.getCollections();
        if (!collections.length) {
          return;
        }
        const currentNfts = collections.reduce(
          (all, collection) => all + collection.total.toNumber(),
          0,
        );
        setNfts(currentNfts);
      })();
    }
  }, [id, allPortfolios]);

  useEffect(() => {}, [selectedPortfolio]);

  const toggleEditModal = () => setEditExpanded((prev) => !prev);
  const toggleMoveModal = () => setMoveExpanded((prev) => !prev);

  return selectedPortfolio ? (
    <StyledWrapper>
      <StyledTopInfo>
        <IconWrapper>
          {portfolioLoading ? (
            <SkeletonLoader
              circle
              width={isMobile ? 48 : 64}
              height={isMobile ? 48 : 64}
            />
          ) : (
            <Icon name="PortfolioIcon" size="32px" />
          )}
        </IconWrapper>
        {portfolioLoading ? (
          <SkeletonLoader height={isMobile ? 48 : 64} />
        ) : (
          <div className={clsx('info')}>
            <StyledPortfolioInfo>
              <Heading type="h3" transform="capitalize">
                {selectedPortfolio.name}
              </Heading>
              {!isMobile &&
                (selectedPortfolio.id === 'default' ? null : (
                  <StyledDetails>
                    Portfolio ID:
                    <span>{selectedPortfolio.id || ''}</span>
                  </StyledDetails>
                ))}
            </StyledPortfolioInfo>
            <StyledPortfolioInfo>{nfts} NFT(s)</StyledPortfolioInfo>
            <StyledPortfolioInfo>
              {selectedPortfolio.assets.length} Token(s)
              <StyledDetails>
                {!isMobile && (
                  <>
                    Custody by:
                    <span>
                      {formatDid(
                        selectedPortfolio.custodian.did,
                        isSmallDesktop ? 4 : 7,
                        isSmallDesktop ? 4 : 8,
                      )}
                    </span>
                    <CopyToClipboard value={selectedPortfolio.custodian.did} />
                  </>
                )}
              </StyledDetails>
            </StyledPortfolioInfo>
          </div>
        )}
        {isMobile && !portfolioLoading && (
          <StyledDeleteButton
            disabled={
              isExternalConnection ||
              !!selectedPortfolio.assets.length ||
              actionInProgress ||
              !identityHasValidCdd ||
              selectedPortfolio.custodian.did !== identity?.did
            }
            onClick={deletePortfolio}
          >
            <Icon name="Delete" />
          </StyledDeleteButton>
        )}
      </StyledTopInfo>
      {isMobile && (
        <div className={clsx('details-bottom')}>
          {selectedPortfolio.id === 'default' ? null : (
            <StyledDetails>
              Portfolio ID:
              <span>{selectedPortfolio.id || ''}</span>
            </StyledDetails>
          )}
          <StyledDetails>
            Custody by:
            <span>{formatDid(selectedPortfolio.custodian.did, 7, 8)}</span>
            <CopyToClipboard value={selectedPortfolio.custodian.did} />
          </StyledDetails>
        </div>
      )}
      <StyledButtonWrapper>
        {portfolioLoading ? (
          <SkeletonLoader height={48} />
        ) : (
          <>
            <Button
              variant="primary"
              onClick={toggleMoveModal}
              disabled={
                isExternalConnection ||
                !identityHasValidCdd ||
                selectedPortfolio.custodian.did !== identity?.did
              }
            >
              <Icon name="Move" />
              Move
            </Button>
            {notDefaultPortfolio && (
              <>
                <Button
                  variant="secondary"
                  disabled={
                    actionInProgress ||
                    !identityHasValidCdd ||
                    isExternalConnection
                  }
                  onClick={toggleEditModal}
                >
                  <Icon name="Edit" />
                  Rename
                </Button>
                {!isMobile && (
                  <Button
                    variant="secondary"
                    disabled={
                      isExternalConnection ||
                      !!selectedPortfolio.assets.length ||
                      actionInProgress ||
                      !identityHasValidCdd ||
                      selectedPortfolio.custodian.did !== identity?.did
                    }
                    onClick={deletePortfolio}
                  >
                    <Icon name="Delete" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </StyledButtonWrapper>
      {editExpanded && (
        <PortfolioModal
          type="edit"
          portfolio={selectedPortfolio}
          toggleModal={toggleEditModal}
        />
      )}
      {moveExpanded && (
        <MoveAssets
          portfolio={selectedPortfolio}
          toggleModal={toggleMoveModal}
        />
      )}
    </StyledWrapper>
  ) : (
    <StyledWrapper>
      <StyledTopInfo>
        <IconWrapper>
          <SkeletonLoader
            circle
            width={isMobile ? 48 : 64}
            height={isMobile ? 48 : 64}
          />
        </IconWrapper>
        <SkeletonLoader height={isMobile ? 48 : 64} />
      </StyledTopInfo>
      <StyledButtonWrapper>
        <SkeletonLoader height={48} />
      </StyledButtonWrapper>
    </StyledWrapper>
  );
};
