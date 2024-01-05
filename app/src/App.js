import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import RegisterForm from "./Register";
import { UserProvider } from "./UserContext";
import Messenger from "./Messenger";
import ProtectedRoute from "./ProtectedRoute";
import { MessageProvider } from "./MessageContext";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/messenger"
            element={
              <ProtectedRoute>
                <MessageProvider>
                  <Messenger />
                </MessageProvider>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
