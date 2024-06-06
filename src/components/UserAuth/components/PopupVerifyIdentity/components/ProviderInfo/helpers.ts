export const fetchIdentityProviderLink = async (
  address: string,
  provider: string,
) => {
  const { body, status } = await fetch(
    `${import.meta.env.VITE_EXTERNAL_IDENTITY_URL}provider-link`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      method: 'POST',
      body: JSON.stringify({
        address,
        provider,
        hCaptcha:
          'P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.hadwYXNza2V5xQTHh7ZA4mKDy3-oUgSr8vTwJvp-PCM-JIVlW3jhz29fVc6uBXq0w-XG9sgAblwL6S87aLq8Sv6itVnnwXvw-YG5KpgWenUvDJKo9OJOjzuNkM03UWg6iIozdHHDZVfjJ_TSoPfu8xlbruGrJFvPpRZX4u6cd7smuZtz39j5UxkCuenifWta2GMvA3K5H3OFSz8oTaK2ZULBnds3WI-Kgk2ZLoWVZvPPKfqgI6XoJ9wDQpXMnJeVVv_w6yS8fvFebDvgB6T16xBJW8Uw2M72Em0TUBVJ0SUga0n9N7_j6AzBiifP37-Iz-k4ZJSwi1Y0Iv7L2o4EWlSTfMxGXjuBwDnyU1m3l3u7lViONuFxRye05mLtFZotOpIfiVSTnSfsCgHLax6T0jEmUIEMpBYu9_C6gJY0GrU05O5awVcxekpxPcKeLF0s_io367acjI3q2YNZ5PwhOpmDiGCMb9hom0Ric8qS0syvp0rBQdAKrCpPXUvF5RBSsWtc0XXzWYKEX9J9FRWurgXmSjTQuLHqE6eRvsFLb5BllnS6hJHm5s0flgGwFZqua1UvzKF3A3RiFXnYhVvUWPxI5ukShL-s2pmqDZcrSqXaeiYbyYmsqdDYioKTPNJSl6MiuUqPul4Tc719OHhF2aQ7V8j4Etd6oKIX9ZKWB4bk9GZ1B55gxXpdcsKV4fxFSHE31cWe4MpVcpLbyNB0__NqVHYQ3kyu8ojWDXIVoYvPy7UJDvkT7AwVNU6GLQboS9Jgi5pAb7oRfIA92UmZDiK1k26ctp7D-4fCwefEsvRV6RDA0UR89n4MdjDKvBSTWHyoa0n_Bav3sy5WRksnEcDci5zGsUPdvYCZRn1JkyX6rRBv1zvjOR1Oxf0RsxotWw9OIZas8DCxUb0tCTkrij-mLjfxsOL51XNULZCM0RM1d-OfpJieLEl9G1I43Bai282feV-JprqMLGShzybQeGPDIPpK5IFBv04xIg9yqsk0fjylslcYeRejp2LTWLwg4BRkzkRaRnoJgy2ZbvJ7779jyG_D46vuqDgd3RnUd2uNcjy2TeIEMqcp2Xl4n9LUUl940o8_urUbRyYrLzMH_QnyC0OTV1t3sQDrQP6H4J7UX7J0lYZ7Su2iLurNHzN0Qwwwr8uL8-QGvJANRLkD-J3zzEont_s91kycHTjXTJw5AD6xk2dPabUhkJQWaaIfjGsCTpEUSj_eE8n6WVy1VFK-To9Xz3xC_kOW_BnynHbV9Ykt5F6MCDTC6HIIwNAB37L0w4AFWQke42B1zEE_s4oadpsMRLkWpJ9cvGXOqw6vsMN56mJ3UEUVVrW7r1wBxKOyZrbeIJn6-VPmeA_BzbvIFrXHmo8s5qvzJqrErI9ft94aA99DhGRL9D1NtZZXwJjMYhidsXYborrQTNIn-POzsJBWuUdMKG3k7CilTGI0wIWkGfOtpSEuGOh-YYU6yKFp1u4QcWpcC_dQp4ynQUtxZiPRoaYjSdS_Ld0S2Zj0EtSiLXiQsrXOwu97Yb6gcd8FQN78VvCQmk8CFNJCzMZesM6E-eCoheTapobjS0EaZkHNpYtU1oCxZ-iM2rTEmliFQrM_O55N56dUg-lLgW3SYDfPboyfTY0siL_V4lvsSFyjZXhwzmZfvPqoc2hhcmRfaWTOFZnkVKJrcqcyMzFiM2UzonBkAA.y_-x1JntogZA1h1vwnGi4t9wIGARw3CjMyxmBCyehpo',
      }),
    },
  );
  if (!body || status !== 201) {
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
