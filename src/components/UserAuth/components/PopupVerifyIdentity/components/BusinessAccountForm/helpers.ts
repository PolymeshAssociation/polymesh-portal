export const fetchContactUs = async (contactFields: {
  firstName: string;
  email: string;
}) => {
  try {
    await fetch(
      'https://forms.hscollectedforms.net/collected-forms/submit/form',
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'strict-origin-when-cross-origin',
        },
        method: 'POST',
        body: JSON.stringify({
          collectedFormId: 'wf-form-Contact-Form',
          portalId: 20411464,
          token: -1718911445,
          type: 'SCRAPED',
          utk: 'afe883217bd42e83f50656d3be64272d',
          collectedFormAction:
            'https://network.us9.list-manage.com/subscribe/post?u=35f15c63879694cc1e74841d7&amp;id=4f52c57b4a&amp;f_id=000a12e1f0',
          contactFields,
        }),
      },
    );

    return true;
  } catch (error) {
    return false;
  }
};
