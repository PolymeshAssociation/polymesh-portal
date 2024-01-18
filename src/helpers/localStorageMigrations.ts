// function to compare semantic version strings
const compareVersions = (a: string, b: string) => {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < 3; i += 1) {
    if (partsA[i] > partsB[i]) return 1;
    if (partsA[i] < partsB[i]) return -1;
  }

  return 0;
};

interface ILocalStorageMigration {
  middlewareUrl: string;
  setMiddlewareUrl: React.Dispatch<React.SetStateAction<string>>;
}

// this function should be modified as required
export const runMigration = (
  localStorageMigrationParam: ILocalStorageMigration,
) => {
  const currentVersion = '1.0.0';

  // Check if localStorage version exists
  const storedVersion = localStorage.getItem('storageVersion');

  if (!storedVersion || compareVersions(storedVersion, currentVersion) < 0) {
    // Migration to new graphQl endpoints as default
    const isOldDefault =
      localStorageMigrationParam.middlewareUrl ===
        'https://mainnet-graphqlnative.polymath.network/' ||
      localStorageMigrationParam.middlewareUrl ===
        'https://testnet-graphqlnative.polymath.network/';
    if (isOldDefault) {
      localStorageMigrationParam.setMiddlewareUrl(
        import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL,
      );
    }
    localStorage.setItem('storageVersion', currentVersion);
  }
};
