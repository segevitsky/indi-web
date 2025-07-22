import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Dashboard from './Dashboard';
import LoginPage from './Login';
import ProtectedRoute from './protectedRoute';
import RegisterForm from './Register';
import PrivacyPolicy from './Policy';



const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;