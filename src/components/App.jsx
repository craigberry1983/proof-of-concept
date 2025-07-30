import { Routes, Route, Navigate } from "react-router-dom";
import DisclaimerScreen from "./DisclaimerScreen";
import SendScreen from "./SendScreen";
import { useMsal } from "../common/MsalContext";

function App() {
  const { isReady, accessToken } = useMsal();

  if (!isReady) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<DisclaimerScreen />} />
      <Route path="/send" element={accessToken ? <SendScreen /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
