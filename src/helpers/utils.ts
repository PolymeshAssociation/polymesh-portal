import { Polymesh } from '@polymeshassociation/polymesh-sdk';

export const downloadCSV = (
  data: object[],
  headings: string[],
  filename: string,
  delimiter = ',',
) => {
  const csvContent = [
    headings.join(delimiter),
    ...data.map((row) => Object.values(row).join(delimiter)),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateDid = async (did: string, sdk: Polymesh) => {
  if (!did) {
    return { isValid: false, error: 'Identity DID is required' };
  }

  try {
    const isValid = await sdk.identities.isIdentityValid({
      identity: did,
    });
    if (!isValid) {
      return { isValid: false, error: 'Identity DID does not exist' };
    }
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid Identity DID' };
  }
};
