import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon } from '~/components';
import { PortfolioContext } from '~/context/PortfolioContext';
import type {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';

const SelectorWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectedPortfoliosDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.landingBackground};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover {
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const DropdownIcon = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border: 1px solid ${({ theme }) => theme.colors.landingBackground};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.landingBackground};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const PortfolioOption = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.landingBackground : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.landingBackground};
  }
`;

const Checkbox = styled.input`
  margin-right: 12px;
  cursor: pointer;
`;

const PortfolioInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const PortfolioId = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const PortfolioName = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

interface IPortfolioPermissionSelectorProps {
  selectedPortfolios: Array<{ id: string; name?: string }>;
  onChange: (portfolios: Array<{ id: string; name?: string }>) => void;
}

export const PortfolioPermissionSelector = ({
  selectedPortfolios,
  onChange,
}: IPortfolioPermissionSelectorProps) => {
  const { allPortfolios } = useContext(PortfolioContext);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Format portfolios for display
  const portfolios = allPortfolios.map((portfolioData) => ({
    id: portfolioData.id || '0',
    name: portfolioData.name,
  }));

  // Filter portfolios based on search
  const filteredPortfolios = portfolios.filter(
    (portfolio: { id: string; name: string }) =>
      portfolio.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTogglePortfolio = (portfolio: {
    id: string;
    name?: string;
  }) => {
    const isSelected = selectedPortfolios.some((p) => p.id === portfolio.id);

    if (isSelected) {
      onChange(selectedPortfolios.filter((p) => p.id !== portfolio.id));
    } else {
      onChange([...selectedPortfolios, portfolio]);
    }
  };

  const isPortfolioSelected = (portfolioId: string) => {
    return selectedPortfolios.some((p) => p.id === portfolioId);
  };

  const getDisplayText = () => {
    if (selectedPortfolios.length === 0) {
      return 'Select portfolios...';
    }
    if (selectedPortfolios.length === 1) {
      const portfolio = portfolios.find(p => p.id === selectedPortfolios[0].id);
      if (portfolio) {
        return portfolio.id === '0' 
          ? 'Default Portfolio' 
          : `${portfolio.id} / ${portfolio.name}`;
      }
      return 'Select portfolios...';
    }
    return `${selectedPortfolios.length} portfolios selected`;
  };

  return (
    <SelectorWrapper ref={wrapperRef}>
      <SelectedPortfoliosDisplay onClick={() => setIsOpen(!isOpen)}>
        <span>{getDisplayText()}</span>
        <DropdownIcon $isOpen={isOpen}>
          <Icon name="ExpandIcon" size="24px" />
        </DropdownIcon>
      </SelectedPortfoliosDisplay>

      <DropdownMenu $isOpen={isOpen}>
        <SearchInput
          type="text"
          placeholder="Search by ID or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />

        {filteredPortfolios.length === 0 ? (
          <NoResults>No portfolios found</NoResults>
        ) : (
          filteredPortfolios.map((portfolio) => (
            <PortfolioOption
              key={portfolio.id}
              $isSelected={isPortfolioSelected(portfolio.id)}
              onClick={() => handleTogglePortfolio(portfolio)}
            >
              <Checkbox
                type="checkbox"
                checked={isPortfolioSelected(portfolio.id)}
                readOnly
              />
              <PortfolioInfo>
                <PortfolioId>
                  {portfolio.id === '0'
                    ? 'Default Portfolio'
                    : `Portfolio ${portfolio.id}`}
                </PortfolioId>
                {portfolio.name && portfolio.id !== '0' && (
                  <PortfolioName>{portfolio.name}</PortfolioName>
                )}
              </PortfolioInfo>
            </PortfolioOption>
          ))
        )}
      </DropdownMenu>
    </SelectorWrapper>
  );
};
