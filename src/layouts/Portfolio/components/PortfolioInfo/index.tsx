import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { usePortfolio } from '~/hooks/polymesh';
import { CopyToClipboard, Icon } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PortfolioModal } from '../PortfolioModal';
import {
  StyledWrapper,
  StyledTopInfo,
  IconWrapper,
  StyledPortfolioInfo,
  StyledDetails,
  StyledButtonWrapper,
} from './styles';
import { formatDid } from '~/helpers/formatters';
import { MoveAssets } from '../MoveAssets';

export const PortfolioInfo = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<IPortfolioData>();
  const { identity, identityHasValidCdd } = useContext(AccountContext);
  const { allPortfolios } = useContext(PortfolioContext);
  const { deletePortfolio, actionInProgress } = usePortfolio(
    selectedPortfolio?.portfolio,
  );
  const [editExpanded, setEditExpanded] = useState(false);
  const [moveExpanded, setMoveExpanded] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const notDefaultPortfolio = !!id && id !== 'default';

  useEffect(() => {
    if (!id) return;

    const current = allPortfolios.find((portfolio) => portfolio.id === id);
    if (current) {
      setSelectedPortfolio(current);
    }
  }, [id, allPortfolios]);

  const toggleEditModal = () => setEditExpanded((prev) => !prev);
  const toggleMoveModal = () => setMoveExpanded((prev) => !prev);

  return selectedPortfolio ? (
    <StyledWrapper>
      <StyledTopInfo>
        <IconWrapper>
          <Icon name="PortfolioIcon" size="32px" />
        </IconWrapper>
        <div className="info">
          <StyledPortfolioInfo>
            <Heading type="h3" transform="capitalize">
              {selectedPortfolio.name}
            </Heading>
            <StyledDetails>
              Portfolio ID:
              <span>{selectedPortfolio.id?.replace('default', '0') || 0}</span>
            </StyledDetails>
          </StyledPortfolioInfo>
          <StyledPortfolioInfo>
            {selectedPortfolio.assets.length} token(s)
            <StyledDetails>
              Custody by:
              <span>{formatDid(selectedPortfolio.custodian.did, 7, 8)}</span>
              <CopyToClipboard value={selectedPortfolio.custodian.did} />
            </StyledDetails>
          </StyledPortfolioInfo>
        </div>
      </StyledTopInfo>
      <StyledButtonWrapper>
        <Button
          variant="primary"
          onClick={toggleMoveModal}
          disabled={
            !identityHasValidCdd ||
            selectedPortfolio.custodian.did !== identity?.did
          }
        >
          Move
        </Button>
        {notDefaultPortfolio && (
          <>
            <Button
              variant="secondary"
              disabled={actionInProgress || !identityHasValidCdd}
              onClick={toggleEditModal}
            >
              Rename
            </Button>
            <Button
              variant="secondary"
              disabled={
                !!selectedPortfolio.assets.length ||
                actionInProgress ||
                !identityHasValidCdd ||
                selectedPortfolio.custodian.did !== identity?.did
              }
              onClick={deletePortfolio}
            >
              Delete
            </Button>
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
  ) : null;
};
