const BLANCK_IDENTITY_STATUS = {
  identity: null,
};

export const fetchExternalIdentityStatus = async (address: string) => {
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
    return BLANCK_IDENTITY_STATUS;
  }
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  const rawData = await reader?.read();
  if (!rawData.value) {
    return BLANCK_IDENTITY_STATUS;
  }
  try {
    const parsedData = JSON.parse(rawData.value);
    return parsedData;
  } catch (_err) {
    // TODO: add parse data in case SyntaxError
    return {};
  }
};
