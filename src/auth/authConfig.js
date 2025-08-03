/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel } from '@azure/msal-browser';

const isLocalhost = window.location.hostname === "localhost";

export const msalConfig = {
    auth: {
        clientId: '21a12e53-22e1-48f3-bdc2-23dba681fbbc',
        authority: 'https://login.microsoftonline.com/common/',
        redirectUri: isLocalhost
            ? "http://localhost:5173/proof-of-concept/"
            : "https://craigberry1983.github.io/proof-of-concept/",

        postLogoutRedirectUri: '/',
        navigateToLoginRequestUrl: true,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const loginRequest = {
    scopes: ['User.Read', 'Mail.Send'],
};