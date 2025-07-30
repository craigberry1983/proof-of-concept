export const msalConfig = {
    auth: {
        clientId: 'b9b1650d-b32e-4ba1-a391-62e0ff4a059b',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: 'https://craigberry1983.github.io/proof-of-concept/send',
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    }
};

export const loginRequest = {
    scopes: ['User.Read', 'Mail.Send']
};