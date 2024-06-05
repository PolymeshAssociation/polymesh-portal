import { notifyError } from '~/helpers/notifications';

export const fetchIdentityProviderLink = async (
  address: string,
  provider: string,
) => {
  const { body, status } = await fetch(
    `${import.meta.env.VITE_CDD_SERVICE_URL}provider-link`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      method: 'POST',
      body: JSON.stringify({
        address,
        provider,
      }),
    },
  );

  if (!body) {
    return null;
  }

  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  const rawData = await reader?.read();

  if (!rawData.value) {
    return null;
  }
  const parsedData = JSON.parse(rawData.value);

  if (status === 400) {
    notifyError(parsedData.message);
    return { link: '' };
  }

  return parsedData;
};

export const fetchMockCdd = async (address: string) => {
  const { status } = await fetch(
    `${import.meta.env.VITE_CDD_SERVICE_URL}mock-cdd/`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      method: 'POST',
      body: JSON.stringify({
        address,
        id: 'testID',
      }),
    },
  );
  if (status !== 201) {
    notifyError('Something went wrong! Please try again');
    return false;
  }
  return true;
};
