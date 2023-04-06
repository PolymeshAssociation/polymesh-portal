import { useState, useEffect, useRef, useContext } from 'react';
import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { DefaultPortfolio as DefaultPortfolioInstance } from '@polymeshassociation/polymesh-sdk/internal';
import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { PortfolioContext } from '~/context/PortfolioContext';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import {
  PortfolioSelectWrapper,
  StyledPortfolioSelect,
  StyledExpandedSelect,
  StyledSelectOption,
  StyledPlaceholder,
} from './styles';

interface IPortfolioSelectProps {
  portfolio: IPortfolioData;
  handleSelect: (option: DefaultPortfolio | NumberedPortfolio) => void;
  selectedPortfolio: DefaultPortfolio | NumberedPortfolio | null;
}

export const PortfolioSelect: React.FC<IPortfolioSelectProps> = ({
  portfolio,
  handleSelect,
  selectedPortfolio,
}) => {
  const { allPortfolios } = useContext(PortfolioContext);
  const [selectedPortfolioName, setSelectedPortfolioName] = useState('');
  const [portfolioSelectExpanded, setPortfolioSelectExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        setPortfolioSelectExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    if (!selectedPortfolio) return;

    if (selectedPortfolio instanceof DefaultPortfolioInstance) {
      setSelectedPortfolioName('Default');
      return;
    }

    (async () => {
      const name = await (selectedPortfolio as NumberedPortfolio).getName();
      setSelectedPortfolioName(name);
    })();
  }, [selectedPortfolio]);

  const filteredPortfolios = allPortfolios.filter(
    ({ id }) => id !== portfolio.id,
  );

  const togglePortfolioSelectDropdown = () =>
    setPortfolioSelectExpanded((prev) => !prev);

  return (
    <>
      <Text bold marginBottom={3}>
        Move to
      </Text>
      <PortfolioSelectWrapper ref={ref}>
        <StyledPortfolioSelect
          onClick={togglePortfolioSelectDropdown}
          expanded={portfolioSelectExpanded}
        >
          {selectedPortfolio ? (
            selectedPortfolioName
          ) : (
            <StyledPlaceholder>Select portfolio</StyledPlaceholder>
          )}
          <Icon name="ExpandIcon" size="18px" className="expand-icon" />
        </StyledPortfolioSelect>
        {portfolioSelectExpanded && (
          <StyledExpandedSelect>
            {filteredPortfolios.length ? (
              filteredPortfolios.map(
                ({ id, name, portfolio: portfolioInstance }) => (
                  <StyledSelectOption
                    key={id}
                    onClick={() => {
                      handleSelect(portfolioInstance);
                      togglePortfolioSelectDropdown();
                    }}
                  >
                    {name}
                  </StyledSelectOption>
                ),
              )
            ) : (
              <StyledPlaceholder>No portfolios available</StyledPlaceholder>
            )}
          </StyledExpandedSelect>
        )}
      </PortfolioSelectWrapper>
    </>
  );
};
