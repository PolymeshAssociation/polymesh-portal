type TUserSubscriptionData = {
  devUpdatesAccepted: boolean;
  newsletterAccepted: boolean;
  termsAccepted: boolean;
  email: string;
};

// TODO: this endpoint is dead. `VITE_CDD_SERVICE_URL` points at the legacy onboarding service,
// which was retired along with chain v7 — the host now redirects to the portal and `/api/*` does
// not respond, so this request hangs until the browser gives up and the caller reports
// "Subscription failed". Repoint at a live newsletter service or remove the signup UI.
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
