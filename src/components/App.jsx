import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/authConfig";
import WelcomeUser from "./WelcomeUser";
import SendScreen from "./SendScreen";
import { Button, Container, Row, Col } from "react-bootstrap";

function App() {
  const { instance } = useMsal();

  const handleLoginRedirect = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        prompt: "create",
      })
      .catch((error) => console.log(error));
  };

  return (
    <Container fluid className="w-100 d-flex justify-content-center p-0" style={{ height: "100dvh" }}>
      <div className="w-100" style={{ maxWidth: "600px", flexGrow: 1 }}>
        <AuthenticatedTemplate>
          <SendScreen />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <WelcomeUser />
          <Row className="justify-content-md-center">
            <Col className="text-center">
              <Button onClick={handleLoginRedirect}>Login</Button>
            </Col>
          </Row>
        </UnauthenticatedTemplate>
      </div>
    </Container>
  );
}

export default App;
