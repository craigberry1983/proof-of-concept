import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import { MsalProvider } from "@azure/msal-react";

export const AuthProvider = ({ children }) => {
  const msalInstance = new PublicClientApplication(msalConfig);

  if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
  }

  //listen for sign-in event and set active account
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      const account = event.payload.account;
      msalInstance.setActiveAccount(account);
    }
  });

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export function useAuthProvider() {
  return { AuthProvider };
}
