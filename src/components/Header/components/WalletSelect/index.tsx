import { useState, useRef, useEffect } from 'react';
import { useAccounts } from '~/hooks/polymesh';
import { Icon } from '~/components';
import {
  StyledSelectWrapper,
  StyledSelect,
  StyledExpandedSelect,
  StyledInput,
  StyledLabel,
  IconWrapper,
} from './styles';
import { formatKey } from '~/helpers/formatters';

export const WalletSelect = () => {
  const { selectedAccount, setSelectedAccount, allAccounts } = useAccounts();
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState('');
  const ref = useRef<JSX.Element | null>();

  useEffect(() => {
    if (!selectedAccount) return;

    setSelected(selectedAccount);
  }, [selectedAccount]);

  // Close dropdown when clicked outside of it
  useEffect(() => {
    const handleClickOutside: React.ReactEventHandler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const handleAccountChange: React.ReactEventHandler = ({ target }) => {
    setSelectedAccount(target.value);
    setSelected(target.value);
    setExpanded(false);
  };

  const handleDropdownToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <StyledSelectWrapper ref={ref}>
      <StyledSelect onClick={handleDropdownToggle} expanded={expanded}>
        {selected ? (
          <>
            {formatKey(selected)}
            <IconWrapper>
              <Icon name="DropdownIcon" />
            </IconWrapper>
          </>
        ) : (
          'loading...'
        )}
      </StyledSelect>
      {expanded && (
        <StyledExpandedSelect>
          {allAccounts.map((option) => (
            <StyledLabel
              key={option}
              htmlFor={option}
              selected={selected === option}
            >
              {formatKey(option)}
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
  );
};
