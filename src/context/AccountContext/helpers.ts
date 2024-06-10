import { EExternalIdentityStatus, IExternalIdentity } from './constants';

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
    const parsedData: IExternalIdentity = BLANCK_IDENTITY;

    if (!rawResponse.value) {
      return parsedData;
    }
    if (rawResponse.value.includes('provider')) {
      parsedData.status = EExternalIdentityStatus.PENDING;
    }
    if (rawResponse.value.includes('did')) {
      const responseArr = rawResponse.value.split('"did":"');
      parsedData.identity = responseArr[1].slice(0, 66);
      parsedData.status = EExternalIdentityStatus.VERIFIED;
    }
    return parsedData;
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
