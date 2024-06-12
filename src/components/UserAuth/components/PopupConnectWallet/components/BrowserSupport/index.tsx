import { useAuthContext } from '~/context/AuthContext';
import { Text, Heading } from '~/components/UiKit';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SUPPORTED_BROWSERS } from '../../../../constants';
import { StyledHeadingWrap } from './styles';

interface IBrowserSupportProps {
  walletName: string;
}

export const BrowserSupport = ({ walletName }: IBrowserSupportProps) => {
  const { setConnectPopup } = useAuthContext();

  const currentWalletBrowsers = SUPPORTED_BROWSERS[walletName].names;
  return (
    <>
      <StyledHeadingWrap>
        <Heading type="h4">
          {walletName} is not supported on your browser, please use one of the
          following browsers instead:
        </Heading>
      </StyledHeadingWrap>
      <div>
        {currentWalletBrowsers.map((browser) => (
          <Text key={browser} size="large" marginTop={4}>
            {browser}
          </Text>
        ))}
      </div>
      <PopupActionButtons onGoBack={() => setConnectPopup('extensions')} />
    </>
  );
};
