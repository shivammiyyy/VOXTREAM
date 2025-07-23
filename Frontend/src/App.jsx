import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
// import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import CallPage from "./pages/CallPage";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import PrivateRoute from "./components/Shared/PrivateRoute";
import OnboardingPage from "./pages/onboardingPage.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/onboarding"
          element={<PrivateRoute><OnboardingPage /></PrivateRoute>}
        />
        <Route
          path="/home"
          element={<PrivateRoute><HomePage /></PrivateRoute>}
        />
        <Route
          path="/chat/:friendId"
          element={<PrivateRoute><ChatPage /></PrivateRoute>}
        />
        <Route
          path="/call/:id"
          element={<PrivateRoute><CallPage /></PrivateRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
