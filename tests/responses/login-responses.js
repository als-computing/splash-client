export default {
  userNotRegistered: {
    data: {
      error: 'user_not_found',
      message: 'user not found',
    },
  },
  multipleAccounts: {
    data: {
      error: 'multiple_users',
      message: 'Multiple Users',

    },
  },
  otherError: {
    data: {
      error: 'unforgeable_ring',
      message: 'Sauron could not craft the one ring',
    },
  },
  success:
  {
    data: {
      access_token: 'THE ONE RING',
      refresh_token: 'Cast it into the fire, destroy it!',
      user: {
        authenticators: [
          {
            issuer: 'https://accounts.google.com',
            subject: 'Middle earth',
            email: 'sauron@mordor.net',
          },
          {
            issuer: 'accounts.google.com',
            subject: 'Middle earth',
            email: 'sauron@mordor.net',
          }],
        name: 'Mairon',
        uid: ' f6635241-50c0-43d6-82e6-16e3e4258977 ',
      },
    },
  },
};
