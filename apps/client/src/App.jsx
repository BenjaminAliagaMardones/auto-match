import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/containers/LoginPage';
import RegisterPage from './features/auth/containers/RegisterPage';
import UnifiedFeed from './features/feed/containers/UnifiedFeed';
import UnifiedListings from './features/feed/containers/UnifiedListings';
import UnifiedMatches from './features/feed/containers/UnifiedMatches';
import UnifiedProfile from './features/feed/containers/UnifiedProfile';
import UnifiedChat from './features/feed/containers/UnifiedChat';
import NewListing from './features/feed/containers/NewListing';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Unified App Routes inside MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/app/feed" element={<UnifiedFeed />} />
          <Route path="/app/listings" element={<UnifiedListings />} />
          <Route path="/app/matches" element={<UnifiedMatches />} />
          <Route path="/app/profile" element={<UnifiedProfile />} />

          {/* Seller routes */}
          <Route path="/seller/listings/new" element={<NewListing />} />
        </Route>

        <Route path="/app/chat/:id" element={<UnifiedChat />} />

        {/* Catch-all redirect to feed */}
        <Route path="*" element={<Navigate to="/app/feed" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
