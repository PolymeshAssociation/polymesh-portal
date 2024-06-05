import { EKeyIdentityStatus, IApplication } from './constants';

const BLANK_IDENTITY = {
  identity: null,
  status: EKeyIdentityStatus.UNASSIGNED,
};

export const fetchCddApplicationStatus = async (address: string) => {
  try {
    const { body, status } = await fetch(
      `${import.meta.env.VITE_CDD_SERVICE_URL}verify-address`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'strict-origin-when-cross-origin',
        },
        method: 'POST',
        body: JSON.stringify({ address }),
      },
    );
    if (!body || status !== 201) {
      return BLANK_IDENTITY;
    }
    const reader = body.pipeThrough(new TextDecoderStream()).getReader();
    const rawResponse = await reader?.read();

    if (!rawResponse.value) {
      return BLANK_IDENTITY;
    }

    const parsedResponse = JSON.parse(rawResponse.value);

    if (parsedResponse.applications?.length) {
      return {
        identity: parsedResponse.identity,
        status: EKeyIdentityStatus.PENDING,
        applications: parsedResponse.applications as IApplication[],
      };
    }
    if (parsedResponse.identity?.did) {
      return {
        identity: parsedResponse.identity,
        status: EKeyIdentityStatus.VERIFIED,
      };
    }
    return BLANK_IDENTITY;
  } catch (err) {
    return BLANK_IDENTITY;
  }
};
