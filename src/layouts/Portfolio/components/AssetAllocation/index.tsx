import { Text } from '~/components/UiKit';
import {
  StyledWrapper,
  StyledPercentageBar,
  StyledFraction,
  StyledLegendList,
  StyledLegendItem,
} from './styles';

const options = [
  {
    ticker: 'BTC',
    percentage: 75,
  },
  {
    ticker: 'ETH',
    percentage: 20,
  },
  {
    ticker: 'DOT',
    percentage: 3,
  },
  {
    ticker: 'USDT',
    percentage: 2,
  },
];

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 4) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-bitwise
    const value = (hash >> (i * 2)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }
  return color;
};

export const AssetAllocation = () => {
  return (
    <StyledWrapper>
      <Text size="large" bold>
        Asset allocation
      </Text>
      <StyledPercentageBar>
        {options.map(({ ticker, percentage }) => (
          <StyledFraction
            key={ticker}
            percentage={percentage}
            color={stringToColor(ticker)}
          />
        ))}
      </StyledPercentageBar>
      <StyledLegendList>
        {options.map(({ ticker, percentage }) => (
          <StyledLegendItem key={ticker} color={stringToColor(ticker)}>
            {ticker}
            <span>{percentage}%</span>
          </StyledLegendItem>
        ))}
      </StyledLegendList>
    </StyledWrapper>
  );
};
