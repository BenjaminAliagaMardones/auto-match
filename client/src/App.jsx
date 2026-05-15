import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/containers/LoginPage';
import RegisterPage from './features/auth/containers/RegisterPage';
import BuyerFeed from './features/feed/containers/BuyerFeed';
import BuyerMatches from './features/feed/containers/BuyerMatches';
import BuyerProfile from './features/feed/containers/BuyerProfile';
import BuyerChat from './features/feed/containers/BuyerChat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/buyer/feed" element={<BuyerFeed />} />
        <Route path="/buyer/matches" element={<BuyerMatches />} />
        <Route path="/buyer/profile" element={<BuyerProfile />} />
        <Route path="/buyer/chat/:id" element={<BuyerChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;