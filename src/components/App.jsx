import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/authConfig";
import WelcomeUser from "./WelcomeUser";
import SendScreen from "./SendScreen";

function App() {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const handleLoginRedirect = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        prompt: "create",
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="App">
      <AuthenticatedTemplate>{activeAccount ? <SendScreen /> : null}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <>
          <WelcomeUser />
          <button onClick={handleLoginRedirect}>Login</button>
        </>
      </UnauthenticatedTemplate>
    </div>
  );
}

export default App;
