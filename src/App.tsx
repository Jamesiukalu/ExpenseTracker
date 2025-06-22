import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import InitialQuestionnaire from "./components/InitialQuestionnaire";
import Home from "./components/home";
import ImportData from "./components/ImportData";
import HelpSupport from "./components/HelpSupport";
import Settings from "./components/Settings";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import Notifications from "./components/Notification";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Entry point is Login */}
          <Route path="/register" element={<Register />} />
          <Route path="/questionnaire" element={<InitialQuestionnaire />} />
          <Route path="/home" element={<Home />} />
          <Route path="/import" element={<ImportData />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/settings" element={<Settings userId={""} />} />   
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />     
        </Routes>
          <Toaster />
      </>
    </Suspense>
  );
}

export default App;