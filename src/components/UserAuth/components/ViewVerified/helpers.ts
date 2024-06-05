type TUserSubscriptionData = {
  devUpdatesAccepted: boolean;
  newsletterAccepted: boolean;
  termsAccepted: boolean;
  email: string;
};

export const fetchEmailSubscription = async (
  subscriptionData: TUserSubscriptionData,
) => {
  const { status } = await fetch(
    `${import.meta.env.VITE_CDD_SERVICE_URL}email`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'strict-origin-when-cross-origin',
      },
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    },
  );
  if (status === 201) {
    return true;
  }
  return false;
};
