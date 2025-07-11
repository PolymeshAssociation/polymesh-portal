import {
  ClaimType,
  CountryCode,
} from '@polymeshassociation/polymesh-sdk/types';
import { useState, useMemo, useCallback } from 'react';
import { Toggler, Text, DropdownSelect } from '~/components/UiKit';
import { ISelectedClaimItem } from '../../constants';
import { StyledInput, StyledInputWrapper, StyledLabel } from '../../styles';
import { StyledWrapper, StyledTopInfo } from './styles';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { removeTimezoneOffset } from '~/helpers/dateTime';

interface INewClaimItem {
  label: string;
  value: ClaimType;
  handleAdd: (newClaim: ISelectedClaimItem) => void;
  handleDelete: (claimType: ClaimType) => void;
}

export const NewClaimItem: React.FC<INewClaimItem> = ({
  label,
  value,
  handleAdd,
  handleDelete,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode | null>(null);
  const [countryCodeError, setCountryCodeError] = useState<string>('');
  const [expiry, setExpiry] = useState<Date | null>(null);

  const countryNameLookup = useMemo(() => {
    return new Map(countryCodes.map(({ name, code }) => [name, code]));
  }, []);

  const handleToggle = useCallback(
    (toggleState: boolean) => {
      setIsSelected(toggleState);
      if (toggleState && value !== ClaimType.Jurisdiction) {
        handleAdd({ claimType: value, expiry });
      } else if (toggleState && value === ClaimType.Jurisdiction) {
        handleAdd({ claimType: value, expiry, code: countryCode });
      } else if (!toggleState && value === ClaimType.Jurisdiction) {
        setCountryCode(null);
        handleDelete(value);
        setExpiry(null);
      } else {
        handleDelete(value);
        setExpiry(null);
      }
    },
    [value, expiry, countryCode, handleAdd, handleDelete],
  );

  const handleDateChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      ({ target }) => {
        const date = removeTimezoneOffset(target.valueAsDate);

        setExpiry(date);

        if (value === ClaimType.Jurisdiction) {
          handleAdd({ claimType: value, expiry: date, code: countryCode });
        } else {
          handleAdd({ claimType: value, expiry: date });
        }
      },
      [value, countryCode, handleAdd],
    );

  const handleCountryChange = useCallback(
    (option: string | null) => {
      const isoCode = countryNameLookup.get(option || '');
      if (!isoCode) {
        setCountryCodeError('Country is required');
        return;
      }
      const code = `${isoCode.charAt(0)}${isoCode
        .slice(1)
        .toLowerCase()}` as CountryCode;

      setCountryCode(code);
      setCountryCodeError('');
      handleAdd({ claimType: value, code, expiry });
    },
    [countryNameLookup, value, expiry, handleAdd],
  );

  return (
    <StyledWrapper>
      <StyledTopInfo>
        <Text bold>{label}</Text>
        <Toggler
          id={value}
          isEnabled={isSelected}
          handleChange={handleToggle}
        />
      </StyledTopInfo>
      {isSelected && (
        <>
          {value === ClaimType.Jurisdiction && (
            <StyledInputWrapper $marginTop={20}>
              <DropdownSelect
                label="Country"
                placeholder="Select Country"
                options={countryCodes.map(({ name }) => name)}
                onChange={handleCountryChange}
                error={countryCodeError}
                enableSearch
              />
            </StyledInputWrapper>
          )}
          <StyledInputWrapper $marginTop={20}>
            <StyledLabel>Expiry Date (Optional)</StyledLabel>
            <StyledInput
              type="date"
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </StyledInputWrapper>
        </>
      )}
    </StyledWrapper>
  );
};
