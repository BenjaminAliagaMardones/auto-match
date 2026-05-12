import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/containers/LoginPage';
import RegisterPage from './features/auth/containers/RegisterPage';
import BuyerFeed from './features/feed/containers/BuyerFeed';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/buyer/feed" element={<BuyerFeed />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;