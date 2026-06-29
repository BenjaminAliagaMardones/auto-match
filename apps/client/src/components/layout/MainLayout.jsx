import { Outlet } from 'react-router-dom';
import BottomNav from '../../features/feed/components/BottomNav';

export default function MainLayout() {
  return (
    <div className="feed-page">
      <div className="feed-mobile-container">
        {/* Renderiza la ruta activa (Feed, Listings, etc.) */}
        <Outlet />

        {/* La navegación inferior siempre está presente en estas rutas */}
        <BottomNav />
      </div>
    </div>
  );
}
