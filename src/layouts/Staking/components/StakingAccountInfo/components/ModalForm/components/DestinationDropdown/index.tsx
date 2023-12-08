import { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useOutsideClick } from '~/hooks/utility';
import { Text } from '~/components/UiKit';
import { Icon } from '~/components';
import {
  PAYMENT_DESTINATION,
  PAYMENT_DESTINATION_LABELS,
} from '../../../../constants';
import { IFieldValues } from '../../constants';
import {
  SelectWrapper,
  StyledSelect,
  StyledExpandedSelect,
  StyledPlaceholder,
  SelectedOption,
  StyledSelectOption,
} from '../../styles';

interface IDestinationDropdownProps {
  currentDestination?: keyof typeof PAYMENT_DESTINATION;
}

export const DestinationDropdown: React.FC<IDestinationDropdownProps> = ({
  currentDestination,
}) => {
  const [expanded, setExpanded] = useState(false);

  const ref = useOutsideClick(() => setExpanded(false));
  const toggleSelectDropdown = () => setExpanded((prev) => !prev);

  const { watch, setValue } = useFormContext<IFieldValues>();

  const destination = watch('destination');

  useEffect(() => {
    if (!destination) {
      if (currentDestination) {
        if (
          PAYMENT_DESTINATION[currentDestination] !==
          PAYMENT_DESTINATION.Account
        ) {
          setValue('destination', currentDestination);
        } else {
          setValue('destination', PAYMENT_DESTINATION.Account);
        }
      } else {
        // Default value
        setValue('destination', PAYMENT_DESTINATION.Staked);
      }
    }
  }, [currentDestination, destination, setValue]);

  return (
    <Controller
      name="destination"
      render={({ field: { onChange, value } }) => (
        <div>
          <Text size="medium" bold marginBottom={3}>
            Reward Payment Address
          </Text>
          <SelectWrapper ref={ref}>
            <StyledSelect onClick={toggleSelectDropdown} $expanded={expanded}>
              {value ? (
                <SelectedOption>
                  {
                    PAYMENT_DESTINATION_LABELS[
                      value as keyof typeof PAYMENT_DESTINATION
                    ]
                  }
                </SelectedOption>
              ) : (
                <StyledPlaceholder>
                  Select Payment Destination
                </StyledPlaceholder>
              )}
              <Icon name="ExpandIcon" className="expand-icon" size="18px" />
            </StyledSelect>
            {expanded && (
              <StyledExpandedSelect>
                {Object.keys(PAYMENT_DESTINATION).map(
                  (selectableDestination) => (
                    <StyledSelectOption
                      key={selectableDestination}
                      onClick={() => {
                        onChange(
                          selectableDestination as keyof typeof PAYMENT_DESTINATION,
                        );
                        setExpanded(false);
                      }}
                    >
                      {
                        PAYMENT_DESTINATION_LABELS[
                          selectableDestination as keyof typeof PAYMENT_DESTINATION_LABELS
                        ]
                      }
                    </StyledSelectOption>
                  ),
                )}
              </StyledExpandedSelect>
            )}
          </SelectWrapper>
        </div>
      )}
    />
  );
};
