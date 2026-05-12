import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// Datos de ejemplo para las tarjetas
const SAMPLE_CARS = [
  {
    id: 1,
    title: 'Toyota Corolla 2022',
    price: '$12.500.000',
    year: '2022',
    km: '28.000 km',
    location: 'Temuco',
    type: 'Sedán',
    emoji: '🚗',
  },
  {
    id: 2,
    title: 'Mazda CX-5 2021',
    price: '$18.900.000',
    year: '2021',
    km: '35.000 km',
    location: 'Santiago',
    type: 'SUV',
    emoji: '🚙',
  },
  {
    id: 3,
    title: 'Ford Mustang 2020',
    price: '$25.000.000',
    year: '2020',
    km: '15.000 km',
    location: 'Concepción',
    type: 'Deportivo',
    emoji: '🏎️',
  },
  {
    id: 4,
    title: 'Hyundai Tucson 2023',
    price: '$22.300.000',
    year: '2023',
    km: '12.000 km',
    location: 'Valparaíso',
    type: 'SUV',
    emoji: '🚙',
  },
  {
    id: 5,
    title: 'Chevrolet Spark 2021',
    price: '$7.800.000',
    year: '2021',
    km: '42.000 km',
    location: 'Temuco',
    type: 'Citycar',
    emoji: '🚕',
  },
  {
    id: 6,
    title: 'Kia Sportage 2022',
    price: '$19.500.000',
    year: '2022',
    km: '20.000 km',
    location: 'La Serena',
    type: 'SUV',
    emoji: '🚙',
  },
];

// Componente de tarjeta swipeable
function SwipeCard({ car, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    const swipeThreshold = 120;
    if (info.offset.x > swipeThreshold) {
      onSwipe('like');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('dislike');
    }
  };

  if (!isTop) {
    return (
      <motion.div
        className="swipe-card"
        style={{ scale: 0.95, y: 12 }}
        initial={false}
      >
        <div className="swipe-card-image">
          <span className="swipe-card-image-placeholder">{car.emoji}</span>
        </div>
        <div className="swipe-card-info">
          <h3 className="swipe-card-title">{car.title}</h3>
          <p className="swipe-card-price">{car.price}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate, zIndex: 10 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* LIKE overlay */}
      <motion.div className="swipe-overlay swipe-overlay-like" style={{ opacity: likeOpacity }}>
        <span className="swipe-overlay-text">LIKE</span>
      </motion.div>

      {/* NOPE overlay */}
      <motion.div className="swipe-overlay swipe-overlay-nope" style={{ opacity: nopeOpacity }}>
        <span className="swipe-overlay-text">NOPE</span>
      </motion.div>

      <div className="swipe-card-image">
        <span className="swipe-card-image-placeholder">{car.emoji}</span>
        <span className="swipe-card-badge">{car.type}</span>
      </div>
      <div className="swipe-card-info">
        <h3 className="swipe-card-title">{car.title}</h3>
        <p className="swipe-card-price">{car.price}</p>
        <div className="swipe-card-details">
          <span className="swipe-card-tag">📅 {car.year}</span>
          <span className="swipe-card-tag">📏 {car.km}</span>
          <span className="swipe-card-tag">📍 {car.location}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function BuyerFeed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState(SAMPLE_CARS);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleSwipe = useCallback((direction) => {
    // Por ahora solo visual — elimina la carta del stack
    setCars((prev) => prev.slice(1));
  }, []);

  const handleLike = () => handleSwipe('like');
  const handleDislike = () => handleSwipe('dislike');
  const handleSkip = () => handleSwipe('skip');

  const currentCar = cars[0];
  const nextCar = cars[1];

  return (
    <div className="feed-page">
      {/* Sidebar */}
      <aside className="feed-sidebar">
        <div className="feed-sidebar-logo">🚗 AutoMatch</div>

        <nav className="feed-nav">
          <button className="feed-nav-item active">
            <span>🔥</span> Explorar
          </button>
          <button className="feed-nav-item">
            <span>❤️</span> Mis Likes
          </button>
          <button className="feed-nav-item">
            <span>🤝</span> Matches
          </button>
          <button className="feed-nav-item">
            <span>💬</span> Mensajes
          </button>
        </nav>

        <div className="feed-user-section">
          <p className="feed-user-email">
            Conectado como:
            <span>{user?.email || 'Usuario'}</span>
          </p>
          <button onClick={handleLogout} className="feed-logout-btn">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="feed-main">
        <div className="feed-header">
          <div>
            <h1 className="feed-header-title">Explorar Vehículos</h1>
            <p className="feed-header-subtitle">{cars.length} vehículos disponibles</p>
          </div>
        </div>

        {currentCar ? (
          <>
            {/* Card Stack */}
            <div className="card-stack">
              <AnimatePresence>
                {nextCar && (
                  <SwipeCard
                    key={nextCar.id}
                    car={nextCar}
                    onSwipe={() => {}}
                    isTop={false}
                  />
                )}
                <SwipeCard
                  key={currentCar.id}
                  car={currentCar}
                  onSwipe={handleSwipe}
                  isTop={true}
                />
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="action-btn action-btn-dislike"
                onClick={handleDislike}
                title="No me gusta"
                id="btn-dislike"
              >
                ✕
              </button>
              <button
                className="action-btn action-btn-like"
                onClick={handleLike}
                title="Me gusta"
                id="btn-like"
              >
                ❤️
              </button>
              <button
                className="action-btn action-btn-skip"
                onClick={handleSkip}
                title="Pasar"
                id="btn-skip"
              >
                ⏭️
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-emoji">🏁</div>
            <h2 className="empty-state-title">¡Ya viste todos!</h2>
            <p className="empty-state-text">
              No hay más vehículos por ahora. Vuelve pronto para ver nuevas publicaciones.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}