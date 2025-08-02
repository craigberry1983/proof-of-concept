import { createContext, useContext, useEffect, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "../../authConfig";

const msalInstance = new PublicClientApplication(msalConfig);
const MsalContext = createContext();

export const MsalProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [account, setAccount] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const init = async () => {
      await msalInstance.initialize();

      const response = await msalInstance.handleRedirectPromise();
      const activeAccount = response?.account || msalInstance.getAllAccounts()[0];

      if (activeAccount) {
        try {
          const tokenResp = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: activeAccount,
          });
          setAccount(activeAccount);
          setAccessToken(tokenResp.accessToken);
        } catch (err) {
          console.warn("[MSAL] Failed to acquire token silently:", err);
        }
      }

      setIsReady(true);
    };

    init();
  }, []);

  const login = async (navigate) => {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);

      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: loginResponse.account,
      });

      setAccount(loginResponse.account);
      setAccessToken(tokenResponse.accessToken);

      navigate("/send");
    } catch (err) {
      console.error("[MSAL] Login failed:", err);
    }
  };

  const logout = () => {
    msalInstance.logoutPopup();
    setAccount(null);
    setAccessToken(null);
    navigate("/");
  };

  return <MsalContext.Provider value={{ msalInstance, isReady, account, accessToken, login, logout }}>{children}</MsalContext.Provider>;
};

export const useMsal = () => useContext(MsalContext);
