import { useContext, useState } from 'react';
import { PolymeshContext, PolymeshProvider } from 'context/PolymeshContext';
import { ThemeContext, AppThemeProvider } from 'context/ThemeContext';

// Temporarily just a raw landing screen demo to test wallet connection and retrieving account data

const App = () => {
  const {
    accounts,
    connectWallet,
    state: { connecting },
    api: { sdk },
  } = useContext(PolymeshContext);

  const { currentTheme, toggleTheme } = useContext(ThemeContext);

  const [did, setDid] = useState('');
  const [balance, setBalance] = useState('');

  const getAccountData = async () => {
    const data = await sdk.getSigningIdentity();
    setDid(data?.did || '');
    const accountBalance = await sdk.accountManagement.getAccountBalance({
      account: accounts[0],
    });
    setBalance(accountBalance.free.toString());
  };

  const isDataRetrieved = did && balance;

  return (
    <div className={currentTheme}>
      <button type="button" onClick={toggleTheme}>
        Change theme
      </button>
      <h1>Polymesh user portal</h1>
      {!accounts.length && !connecting && (
        <button onClick={connectWallet} type="button">
          Connect wallet
        </button>
      )}
      {connecting && <h3>Loading...</h3>}

      {!!accounts.length && !connecting && (
        <>
          <h3>Connected accounts:</h3>
          <ul>
            {accounts.map((address, idx) => (
              <li key={address}>{idx === 0 ? <b>{address}</b> : address}</li>
            ))}
          </ul>
          {!isDataRetrieved && (
            <button type="button" onClick={getAccountData}>
              Get selected account data
            </button>
          )}
        </>
      )}
      {isDataRetrieved && (
        <div>
          <p>DID: {did}</p>
          <p>Balance: {balance} POLYX</p>
        </div>
      )}
    </div>
  );
};

const WrappedApp = () => {
  return (
    <PolymeshProvider>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </PolymeshProvider>
  );
};

export default WrappedApp;
