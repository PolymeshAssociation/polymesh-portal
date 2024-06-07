export const fetchEmailSubscription = async (email: string) => {
  const { status } = await fetch(
    `${import.meta.env.VITE_EXTERNAL_IDENTITY_URL}email`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'strict-origin-when-cross-origin',
      },
      method: 'POST',
      // TODO: update payload
      body: JSON.stringify({
        devUpdatesAccepted: true,
        newsletterAccepted: true,
        termsAccepted: true,
        email,
      }),
    },
  );
  if (status === 201) {
    return true;
  }
  return false;
};
