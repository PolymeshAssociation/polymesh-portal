import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from '~/components';
import CopyToClipboard from '~/components/CopyToClipboard';
import { AccountContext } from '~/context/AccountContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { formatDid } from '~/helpers/formatters';
import { usePortfolioLookup } from '~/hooks/polymesh/usePortfolioLookup';
import {
  DropdownButton,
  DropdownMenu,
  DropdownOption,
  NoResults,
  PermissionCheckbox,
  PortfolioCheckboxLabel,
  PortfolioCustodianBadge,
  PortfolioId,
  PortfolioInfo,
  PortfolioInfoWrapper,
  PortfolioName,
  PortfolioOwnerDid,
  PortfolioWarningBadge,
  SearchInput,
  SelectWrapper,
} from '../styles';

interface IPortfolioPermissionSelectorProps {
  selectedPortfolios: Array<{ id: string; name?: string; ownerDid?: string }>;
  onChange: (
    portfolios: Array<{ id: string; name?: string; ownerDid?: string }>,
  ) => void;
}

export const PortfolioPermissionSelector = ({
  selectedPortfolios,
  onChange,
}: IPortfolioPermissionSelectorProps) => {
  const { allPortfolios, custodiedPortfolios } = useContext(PortfolioContext);
  const { identity } = useContext(AccountContext);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Use the shared portfolio lookup hook
  const { getPortfolioInfo } = usePortfolioLookup(
    selectedPortfolios.map((p) => ({
      id: p.id,
      ownerDid: p.ownerDid,
      name: p.name,
    })),
  );

  // Extended portfolio data with metadata
  interface ExtendedPortfolioData {
    id: string;
    name: string;
    ownerDid: string;
    isCustodied: boolean;
    portfolio?: DefaultPortfolio | NumberedPortfolio;
  }

  // Format portfolio data for display using context data (no fetching needed)
  const getPortfolioDisplayData = useCallback(
    (
      portfolioData: {
        id?: string;
        name: string;
        portfolio: DefaultPortfolio | NumberedPortfolio;
      },
      isCustodied: boolean,
    ): ExtendedPortfolioData => {
      const { portfolio, name } = portfolioData;
      const ownerDid = portfolio.owner.did;

      // Handle default portfolio
      if (!('id' in portfolio)) {
        return {
          id: 'default',
          name: 'Default Portfolio',
          ownerDid,
          isCustodied,
          portfolio,
        };
      }

      const portfolioId = portfolio.id.toString();

      return {
        id: portfolioId,
        name,
        ownerDid,
        isCustodied,
        portfolio,
      };
    },
    [],
  );

  // Combine owned and custodied portfolios
  const availablePortfolios = useMemo((): ExtendedPortfolioData[] => {
    const owned = allPortfolios.map((p) => getPortfolioDisplayData(p, false));
    const custodied = custodiedPortfolios.map((p) =>
      getPortfolioDisplayData(p, true),
    );

    // Deduplicate using composite key: ownerDid + portfolioId
    // Portfolio "2" owned by Alice is different from portfolio "2" owned by Bob
    const portfolioMap = new Map<string, ExtendedPortfolioData>();

    owned.forEach((p) => {
      const key = `${p.ownerDid}-${p.id}`;
      portfolioMap.set(key, p);
    });

    custodied.forEach((p) => {
      const key = `${p.ownerDid}-${p.id}`;
      // Only skip if exact same portfolio (same owner + same ID)
      if (!portfolioMap.has(key)) {
        portfolioMap.set(key, p);
      }
    });

    const combined = Array.from(portfolioMap.values());

    return combined;
  }, [allPortfolios, custodiedPortfolios, getPortfolioDisplayData]);

  // Helper to match portfolios by composite key (ownerDid + id)
  const portfolioMatches = (
    p1: { id: string; ownerDid?: string },
    p2: { id: string; ownerDid?: string },
  ): boolean => {
    // If both have ownerDid, match on both id and ownerDid
    if (p1.ownerDid && p2.ownerDid) {
      return p1.id === p2.id && p1.ownerDid === p2.ownerDid;
    }
    // Otherwise, fall back to just matching on id (for backwards compatibility)
    return p1.id === p2.id;
  };

  // Identify stale portfolios (selected but not available anymore)
  const stalePortfolios = selectedPortfolios.filter(
    (selected) =>
      !availablePortfolios.some((avail: ExtendedPortfolioData) =>
        portfolioMatches(selected, avail),
      ),
  );

  // All portfolios to display = available + stale
  const allDisplayPortfolios = [
    ...availablePortfolios,
    ...stalePortfolios.map((p) => {
      // Use the hook to get stale portfolio name (will fetch if needed)
      const portfolioInfo = getPortfolioInfo(p.ownerDid, p.id);

      return {
        id: p.id,
        name: portfolioInfo.name,
        ownerDid: p.ownerDid || '', // Preserve owner DID from selected portfolio
        isCustodied: false,
        portfolio: undefined,
      };
    }),
  ];

  // Filter portfolios based on search (including owner DID)
  const filteredPortfolios = allDisplayPortfolios.filter((portfolio) => {
    const searchLower = searchTerm.toLowerCase();
    const idMatch = portfolio.id.toLowerCase().includes(searchLower);
    const nameMatch = portfolio.name.toLowerCase().includes(searchLower);
    const didMatch = portfolio.ownerDid.toLowerCase().includes(searchLower);
    return idMatch || nameMatch || didMatch;
  });

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

  const handleTogglePortfolio = (portfolio: ExtendedPortfolioData) => {
    const isSelected = selectedPortfolios.some((p) =>
      portfolioMatches(p, portfolio),
    );

    if (isSelected) {
      onChange(
        selectedPortfolios.filter((p) => !portfolioMatches(p, portfolio)),
      );
    } else {
      onChange([
        ...selectedPortfolios,
        {
          id: portfolio.id,
          name: portfolio.name,
          ownerDid: portfolio.ownerDid,
        },
      ]);
    }
  };

  const isPortfolioSelected = (portfolio: ExtendedPortfolioData) => {
    return selectedPortfolios.some((p) => portfolioMatches(p, portfolio));
  };

  const getDisplayText = () => {
    if (selectedPortfolios.length === 0) {
      return 'Select portfolios...';
    }
    if (selectedPortfolios.length === 1) {
      const portfolio = selectedPortfolios[0];
      if (portfolio.id === 'default') {
        return 'Default Portfolio';
      }
      // Use the hook to get the correct name
      const portfolioInfo = getPortfolioInfo(portfolio.ownerDid, portfolio.id);
      return `${portfolio.id} - ${portfolioInfo.name}`;
    }
    return `${selectedPortfolios.length} portfolios selected`;
  };

  const isStale = (portfolio: ExtendedPortfolioData) => {
    return stalePortfolios.some((p) => portfolioMatches(p, portfolio));
  };

  const isOwnedByCurrent = (portfolio: ExtendedPortfolioData) => {
    return identity && portfolio.ownerDid === identity.did;
  };

  return (
    <SelectWrapper ref={wrapperRef}>
      <DropdownButton
        as="div"
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{getDisplayText()}</span>
        <Icon name="ExpandIcon" className="expand-icon" size="24px" />
      </DropdownButton>

      {isOpen && (
        <DropdownMenu>
          <SearchInput
            type="text"
            placeholder="Search by ID, name, or owner DID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          {filteredPortfolios.length === 0 ? (
            <NoResults>No portfolios found</NoResults>
          ) : (
            filteredPortfolios.map((portfolio) => {
              const isSelected = isPortfolioSelected(portfolio);
              const isStalePortfolio = isStale(portfolio);
              const isOwned = isOwnedByCurrent(portfolio);
              // Show owner DID for any 3rd party portfolio (custodied or stale)
              const showOwnerDid =
                portfolio.ownerDid &&
                (!isOwned || isStalePortfolio) &&
                portfolio.ownerDid;

              // Use composite key to ensure uniqueness (ownerDid + portfolioId)
              const portfolioKey = `${portfolio.ownerDid}-${portfolio.id}`;

              return (
                <DropdownOption
                  key={portfolioKey}
                  $isSelected={isSelected}
                  onClick={() => handleTogglePortfolio(portfolio)}
                >
                  <PortfolioCheckboxLabel htmlFor={`portfolio-${portfolioKey}`}>
                    <PermissionCheckbox
                      id={`portfolio-${portfolioKey}`}
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                    />
                    <PortfolioInfoWrapper>
                      <PortfolioInfo>
                        <PortfolioId>
                          {portfolio.id === 'default'
                            ? 'Default Portfolio'
                            : portfolio.id}
                        </PortfolioId>
                        {portfolio.name && portfolio.id !== 'default' && (
                          <>
                            <span>-</span>
                            <PortfolioName>{portfolio.name}</PortfolioName>
                          </>
                        )}
                        {portfolio.isCustodied && !isStalePortfolio && (
                          <PortfolioCustodianBadge>
                            Custodian
                          </PortfolioCustodianBadge>
                        )}
                        {isStalePortfolio && (
                          <PortfolioWarningBadge>
                            ⚠️ Not controlled
                          </PortfolioWarningBadge>
                        )}
                      </PortfolioInfo>
                      {showOwnerDid && (
                        <PortfolioOwnerDid title={portfolio.ownerDid}>
                          <span>
                            Owner: {formatDid(portfolio.ownerDid, 6, 4)}
                          </span>
                          <CopyToClipboard value={portfolio.ownerDid} />
                        </PortfolioOwnerDid>
                      )}
                    </PortfolioInfoWrapper>
                  </PortfolioCheckboxLabel>
                </DropdownOption>
              );
            })
          )}
        </DropdownMenu>
      )}
    </SelectWrapper>
  );
};
