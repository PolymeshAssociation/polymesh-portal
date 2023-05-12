import { useState, useRef, useEffect, useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { Icon } from '~/components';
import {
  StyledSelectWrapper,
  StyledSelect,
  StyledExpandedSelect,
  StyledInput,
  StyledLabel,
  IconWrapper,
  StyledKeyLabel,
} from './styles';
import { formatKey } from '~/helpers/formatters';
import { ESelectPlacements, ISelectProps } from './types';
import { useWindowWidth } from '~/hooks/utility';
import { SkeletonLoader } from '../UiKit';

const WalletSelect: React.FC<ISelectProps> = ({
  placement = 'header',
  trimValue = true,
}) => {
  const {
    selectedAccount,
    setSelectedAccount,
    allAccounts,
    primaryKey,
    secondaryKeys,
  } = useContext(AccountContext);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile } = useWindowWidth();

  useEffect(() => {
    if (!selectedAccount) return;

    setSelected(selectedAccount);
  }, [selectedAccount]);

  // Close dropdown when clicked outside of it
  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const handleAccountChange: React.ReactEventHandler = ({ target }) => {
    setSelectedAccount((target as HTMLInputElement).value);
    setSelected((target as HTMLInputElement).value);
    setExpanded(false);
  };

  const handleDropdownToggle = () => {
    setExpanded((prev) => !prev);
  };

  return selected ? (
    <StyledSelectWrapper ref={ref} placement={placement}>
      <StyledSelect
        onClick={handleDropdownToggle}
        expanded={expanded}
        placement={placement}
      >
        {trimValue
          ? formatKey(selected)
          : formatKey(selected, isMobile ? 6 : 8, isMobile ? 6 : 8)}
        <IconWrapper>
          <Icon name="DropdownIcon" />
        </IconWrapper>
      </StyledSelect>
      {expanded && (
        <StyledExpandedSelect placement={placement}>
          {allAccounts
            .sort((account) => (account === selectedAccount ? -1 : 1))
            .map((option) => (
              <StyledLabel
                key={option}
                htmlFor={option}
                selected={selected === option}
                placement={placement}
              >
                {trimValue
                  ? formatKey(option)
                  : formatKey(option, isMobile ? 6 : 8, isMobile ? 6 : 8)}
                {option === primaryKey ? (
                  <StyledKeyLabel primary>Primary</StyledKeyLabel>
                ) : null}
                {secondaryKeys.includes(option) ? (
                  <StyledKeyLabel>Second.</StyledKeyLabel>
                ) : null}
                <StyledInput
                  type="radio"
                  name="key"
                  value={option}
                  id={option}
                  onChange={handleAccountChange}
                />
              </StyledLabel>
            ))}
        </StyledExpandedSelect>
      )}
    </StyledSelectWrapper>
  ) : (
    <SkeletonLoader
      height={placement === ESelectPlacements.HEADER ? undefined : '32px'}
      width={placement === ESelectPlacements.HEADER ? '94px' : undefined}
      baseColor={
        placement === ESelectPlacements.HEADER
          ? undefined
          : 'rgba(255,255,255,0.05)'
      }
      highlightColor={
        placement === ESelectPlacements.HEADER
          ? undefined
          : 'rgba(255, 255, 255, 0.24)'
      }
    />
  );
};

export default WalletSelect;
