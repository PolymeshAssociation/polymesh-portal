import { useState, useEffect, useRef } from 'react';
import { Icon } from '~/components';
import {
  StyledLabel,
  StyledErrorMessage,
  StyledExpandedSelect,
  StyledOption,
  StyledSelect,
  InputWrapper,
} from './styles';

interface IDropdownSelectProps {
  label: string;
  placeholder: string;
  error: string | undefined;
  onChange: (option: string) => void;
  options: string[];
  removeSelection?: boolean;
}

const DropdownSelect: React.FC<IDropdownSelectProps> = ({
  label,
  placeholder,
  error,
  onChange,
  options,
  removeSelection,
}) => {
  const [selectExpanded, setSelectExpanded] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const ref = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectExpanded) return undefined;

    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        setSelectExpanded(false);
        if (!selectedOption) {
          onChange('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onChange, selectedOption, selectExpanded]);

  const handleDropdownToggle = (option?: string) => {
    setSelectExpanded((prev) => !prev);
    if (option) {
      onChange(option);
    }
  };

  useEffect(() => {
    if (!selectExpanded || !selectedRef.current) return;

    selectedRef.current.scrollIntoView({
      block: 'nearest',
    });
  }, [selectExpanded]);

  useEffect(() => {
    if (!removeSelection) {
      return;
    }

    setSelectedOption('');
  }, [removeSelection]);

  return (
    <div>
      <StyledLabel>{label}</StyledLabel>
      <InputWrapper ref={ref}>
        <StyledSelect
          onClick={() => handleDropdownToggle()}
          expanded={selectExpanded}
          isSelected={options.includes(selectedOption)}
        >
          {selectedOption || placeholder}
          <Icon name="ExpandIcon" size="18px" className="icon" />
        </StyledSelect>
        {!!options.length && selectExpanded && (
          <StyledExpandedSelect>
            {options.map((option) => (
              <StyledOption
                ref={option === selectedOption ? selectedRef : null}
                key={option}
                onClick={() => {
                  setSelectedOption(option);
                  handleDropdownToggle(option);
                }}
                isSelected={option === selectedOption}
              >
                {option}
              </StyledOption>
            ))}
          </StyledExpandedSelect>
        )}
        {!!error && <StyledErrorMessage>{error}</StyledErrorMessage>}
      </InputWrapper>
    </div>
  );
};

export default DropdownSelect;
