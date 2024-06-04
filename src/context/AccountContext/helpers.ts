// @Get('/applications/:address')

// 1. verify address
// https://onboarding.polymesh.live/api/verify-address
// payload: { address: "2GkugxKcnE8E3L998ovcLYpT8DxZZxvTS5X4tr8npYGk7Rwc" }

// VERIFIED
// identity: {did: "0xc896345c4b330beeb15af992f8e41e36ecd788c26e61fe20c75d8e0e80b9b3b3", validCdd: true}
// valid: false

// PENDING
// applications: [{id: "fc82c508-5e42-4e98-ae98-a413cdfce3ea",…}]
// identity: null
// valid: true

// NEW
// applications: []
// identity: null
// valid: true

// 2. generate provider link
// https://onboarding.polymesh.network/api/provider-link
// payload: {
//   address:  "2GkugxKcnE8E3L998ovcLYpT8DxZZxvTS5X4tr8npYGk7Rwc"
//   hCaptcha: "P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.hadwYXNza2V5xQS_WGmDUrh9gEVMfjY9Qrl5zckceuc_q10xoC9pfAKo1w9o4yAE_ZAEHXVwcmQx4pVMh1bZASkjG_vlxpZvohkDgGmCMpkdzUwGuxf9Ot90UQOEwnt4pKf-BaMu_b69NKoFAZgr0jqDsvWKkVv-CpGmGgJoW6YxKVJGjhw-aEWKaxQeOSGpCcOUoh16-U04J9L67dLVgtZsQf6bKr5LFbbnKBChAuh4rTSrWBoyJ1xbzJcn5agoFVi6bLkVDlTGpzeKyRx5ctBh9KysB7_Am-VGEXLqjgtEmVa1fIvlsTSp9ORUHJhc76Y8rIsH9f62JGq95xw_jmOoQbvvW0-IKeRwBtjtLFgLVNkMZPN73jBhD4GDm7IcJZS-dXjDUBbZ-xvjG5i2EW9i7MzSxTAcWoP0_U0lneiPykJGHnpG3HzViv5Sdu_f6KT3g__NzFFK0Ugfl18bqjXHBd_dvLP-ts4YcgmOfTtvpEPvsjIXZt8LaHvYFPWz1SvBdPQeVUXra6-Ft1HHKv3yJ3fcRci9-hm9CiPHRWp35YlviyOdQZL7gVpQ2-mAE35vzouYHxco0IBXl7mDqXoJfGJn-uHqpCzyd4C1pRkVQDfiG0wANWA9JIElJzsfa0LyCDTrKzBmD1K4q7p9EZn_4Oapy9tJg3a7tTa-W_Fss5wfEOO--yN2xI2Ay-a_R85K6WB90XTWaLs_c2VygFApEENbAtOA9Btw2oxiqSeyUUHIo5yTh0-pVmGSFxWt8dQ5cT59QHmBWjNZ7zfTFUw_EF5cVtEm_mve90G8sU_dW9twzDDfDK8eHMSR7cnHAdLK93aDiEerWGRj3n9QTp_RFfTzu5kgyD9AJi-3OKaeQBBVzffVtgEkhuiDTw2RV4hoFIC51ev77k4wHmG8SZxqP80J1MHw9T0VGmSoZaHHr7Y6R_7UmVVqeKef50Uofnmhk53geydMXNPoFeCIg_tQmW7CkiVKsnlaU7EdI8dE0cnJd9l2nLXrfH2YmfL2lhF49JOw5TL31DuVfyetpEhUrWQcn27RezBQLROcK_vc3lETOVS3OTn4vCkwaTqRG6-DOQm6cExzvMqj-RxFg6q60zTGXIEi11mxK7b7WA02GX7Mj4_aaqiD8fu_2ZOAraPqeahRe8PmecA3f68ZMc9-6Zw0UPUU3Go5Huk5OOcMRksCoXYSTEGiCXl5wAhIUNXJrBm1M-CpK-u4aT-qnNCTu76dIEAlJarFrtqnOsekot9TiJHHkGtbStDiR_InhVq0Nevglslts4hLQlotVGVfCLJlg0-p9R0-AxJlLx3qxED2z5NcyMhFPXTinNfGapiamoJzgPRqW51U2QN8r1N5f68r-VBnzt4ynIPEQSj7EpCrG2ft0Hm9HkHlvn_pG-FgMMBoQf0Fhk2AVMTFwADH2gpiispFJiZTrb9WXM6NXZVVne8mkA_hlbiqpO9IpuUaXRO7EyqAv6tqe3htNRWG_hXJQFotPI6boASF6K2Lc3K-S4dzhpac4JpJ1A06nOgEtqy70Dp5eECU9QWVnvWovwXXPEQ3YoYxFVzcXd0d_ZVXKGqCyU9HExTkDhzCjGM2_rEP8UpQdHQOFDtvvzBU6tVt8UmcMOQ6o2V4cM5mVtwCqHNoYXJkX2lkzhWZ5FSia3KnNGU3YWYxYqJwZAA.vKU6L3mIsfiCe4NleHZ7Nweua7105cQ211N9Gm720jQ"
//   provider: "jumio"

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
  const parsedData = JSON.parse(rawData.value);
  return parsedData;
};

export const fetchIdentityProviderLink = async (
  address: string,
  provider: string,
) => {
  const { body, status } = await fetch(
    `${import.meta.env.VITE_EXTERNAL_IDENTITY_URL}verify-address`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      method: 'POST',
      body: JSON.stringify({ address, provider }),
    },
  );
  if (!body || status !== 200) {
    return null;
  }
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  const rawData = await reader?.read();
  if (!rawData.value) {
    return null;
  }
  const parsedData = JSON.parse(rawData.value);
  return parsedData;
};
