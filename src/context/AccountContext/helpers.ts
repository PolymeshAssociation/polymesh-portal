import { EExternalIdentityStatus } from './constants';

const BLANCK_IDENTITY = {
  identity: null,
  status: EExternalIdentityStatus.UNASSIGNED,
};

export const fetchExternalIdentityStatus = async (address: string) => {
  try {
    const { body, status } = await fetch(
      `${import.meta.env.VITE_EXTERNAL_IDENTITY_URL}verify-address`,
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
      return BLANCK_IDENTITY;
    }
    const reader = body.pipeThrough(new TextDecoderStream()).getReader();
    const rawResponse = await reader?.read();

    if (!rawResponse.value) {
      return BLANCK_IDENTITY;
    }

    if (rawResponse.value.includes('provider')) {
      return {
        identity: null,
        status: EExternalIdentityStatus.PENDING,
      };
    }
    if (rawResponse.value.includes('did')) {
      const responseArr = rawResponse.value.split('"did":"');
      return {
        identity: responseArr[1].slice(0, 66),
        status: EExternalIdentityStatus.VERIFIED,
      };
    }
    return BLANCK_IDENTITY;
  } catch (err) {
    return BLANCK_IDENTITY;
  }

  // try {
  //   const rawData = JSON.parse(rawResponse.value);
  //   if (rawData.identity) {
  //     parsedData.identity = rawData.identity.did;
  //     parsedData.status = EExternalIdentityStatus.VERIFIED;
  //   }
  //   if (rawData.applications?.length) {
  //     parsedData.status = EExternalIdentityStatus.PENDING;
  //   }
  //   return parsedData;
  // } catch (_err) {
  //   return {};
  // }
};
