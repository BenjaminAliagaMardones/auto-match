import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';

// SVG Car Placeholder
const CarSilhouette = () => (
  <svg viewBox="0 0 200 100" className="swipe-card-car-shape" fill="currentColor">
    <path d="M160.7,39.6c-4.4-8.8-12-16-21.4-19.4L112,11.5c-4.9-1.8-10.1-2.7-15.4-2.7H66.2C54.4,8.8,44,15,37.3,25.2L24,45.4 c-4.6,7-12,12-20,13.7c-0.6,0.1-1,0.6-1,1.2v18c0,2.2,1.8,4,4,4h13.2c1.9,6,7.5,10.4,14.2,10.4s12.3-4.3,14.2-10.4H147 c1.9,6,7.5,10.4,14.2,10.4c6.7,0,12.3-4.3,14.2-10.4h11.6c2.2,0,4-1.8,4-4v-11.8c0-8.6-4.5-16.5-11.8-21L160.7,39.6z M34.4,78.3 c-4,0-7.3-3.3-7.3-7.3s3.3-7.3,7.3-7.3s7.3,3.3,7.3,7.3S38.4,78.3,34.4,78.3z M161.2,78.3c-4,0-7.3-3.3-7.3-7.3s3.3-7.3,7.3-7.3 s7.3,3.3,7.3,7.3S165.2,78.3,161.2,78.3z M66.2,14.8h30.4c3.4,0,6.7,0.6,9.8,1.8L130,24.8c4.6,1.7,8.4,5.1,10.7,9.3l7,13 c-36.9-1-105-1-105-1L52.5,29C55.7,24,60.8,20.8,66.2,14.8z" />
  </svg>
);

// Datos de ejemplo actualizados
const SAMPLE_CARS = [
  {
    id: 1,
    make: 'TOYOTA',
    model: 'Corolla XSE',
    year: '2021',
    price: 'US$ 17.500',
    km: '42.800 km',
    location: 'Temuco',
    type: 'SEDÁN',
    transmission: 'Automática',
    match: 94,
    viewType: 'COROLLA - 3/4 FRONTAL',
  },
  {
    id: 2,
    make: 'MAZDA',
    model: 'CX-5 Grand Touring',
    year: '2020',
    price: 'US$ 22.000',
    km: '35.000 km',
    location: 'Padre Las Casas',
    type: 'SUV',
    transmission: 'Automática',
    match: 88,
    viewType: 'CX-5 - LATERAL',
  },
  {
    id: 3,
    make: 'FORD',
    model: 'Mustang GT',
    year: '2022',
    price: 'US$ 45.000',
    km: '15.000 km',
    location: 'Villarrica',
    type: 'Coupé',
    transmission: 'Manual',
    match: 97,
    viewType: 'MUSTANG - 3/4 TRASERO',
  },
  {
    id: 4,
    make: 'CHEVROLET',
    model: 'Tracker Premier',
    year: '2023',
    price: 'US$ 25.500',
    km: '8.500 km',
    location: 'Pucón',
    type: 'SUV',
    transmission: 'Automática',
    match: 91,
    viewType: 'TRACKER - FRONTAL',
  },
  {
    id: 5,
    make: 'VOLKSWAGEN',
    model: 'Golf GTI',
    year: '2019',
    price: 'US$ 28.000',
    km: '55.000 km',
    location: 'Temuco',
    type: 'Hatchback',
    transmission: 'Automática (DSG)',
    match: 85,
    viewType: 'GOLF - PERFIL',
  },
  {
    id: 6,
    make: 'HONDA',
    model: 'Civic EX-L',
    year: '2021',
    price: 'US$ 21.000',
    km: '32.000 km',
    location: 'Lautaro',
    type: 'Sedán',
    transmission: 'Automática (CVT)',
    match: 95,
    viewType: 'CIVIC - 3/4 FRONTAL',
  },
  {
    id: 7,
    make: 'NISSAN',
    model: 'Frontier Pro-4X',
    year: '2024',
    price: 'US$ 38.000',
    km: '2.000 km',
    location: 'Victoria',
    type: 'Pick-up',
    transmission: 'Automática 4x4',
    match: 82,
    viewType: 'FRONTIER - 3/4 TRASERO',
  },
  {
    id: 8,
    make: 'PEUGEOT',
    model: '208 Allure',
    year: '2022',
    price: 'US$ 15.500',
    km: '28.000 km',
    location: 'Nueva Imperial',
    type: 'Hatchback',
    transmission: 'Manual',
    match: 89,
    viewType: '208 - FRONTAL',
  },
];

// Componente de tarjeta swipeable actualizado
function SwipeCard({ car, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
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
        style={{ scale: 0.95, y: 15 }}
        initial={false}
      >
        <div className="swipe-card-image-area">
          <CarSilhouette />
        </div>
        <div className="swipe-card-info-panel">
          <h3 className="swipe-card-model">{car.model}</h3>
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

      {/* Top Image Area */}
      <div className="swipe-card-image-area">
        <div className="swipe-card-top-tags">
          <div className="swipe-card-view-tag">
            {car.viewType}
          </div>
          <div className="swipe-card-match-badge">
            <span className="swipe-card-match-number">{car.match}</span>
            <span className="swipe-card-match-text">MATCH</span>
          </div>
        </div>
        
        <CarSilhouette />

        <div className="swipe-card-name-overlay">
          <div className="swipe-card-make">{car.make} - <span style={{opacity: 0.8}}>{car.year}</span></div>
          <h2 className="swipe-card-model">{car.model}</h2>
        </div>
      </div>

      {/* Bottom Info Panel */}
      <div className="swipe-card-info-panel">
        <div className="swipe-card-price-row">
          <div className="swipe-card-price">{car.price}</div>
          <div className="swipe-card-type-badge">{car.type}</div>
        </div>
        <div className="swipe-card-details-text">
          {car.km} · <span style={{textTransform: 'lowercase'}}>{car.transmission}</span><br />
          {car.location}
        </div>
      </div>
    </motion.div>
  );
}

export default function BuyerFeed() {
  const [cars, setCars] = useState(SAMPLE_CARS);

  const handleSwipe = useCallback(() => {
    setCars((prev) => prev.slice(1));
  }, []);

  const handleLike = () => handleSwipe('like');
  const handleDislike = () => handleSwipe('dislike');

  const currentCar = cars[0];
  const nextCar = cars[1];

  return (
    <div className="feed-page">
      <div className="feed-mobile-container">
        
        {/* Top Navigation / Header */}
        <header className="feed-top-nav">
          <div className="feed-location-info">
            <span className="feed-location-text">AUTOMATCH · TEMUCO</span>
            <span className="feed-location-text" style={{opacity: 0.6}}>+150KM</span>
            <h1 className="feed-header-title">Tu <span className="feed-header-title-italic">match</span> de<br/>hoy</h1>
          </div>
          <button className="feed-filter-btn" aria-label="Filters">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        </header>

        {/* Visual Filter Tags */}
        <div className="feed-filter-tags">
          <span className="feed-filter-tag">PRECIO</span>
          <span className="feed-filter-tag">KM</span>
          <span className="feed-filter-tag">AÑO</span>
          <span className="feed-filter-tag" style={{borderBottom: '2px solid var(--charcoal)', paddingBottom: '4px'}}>SEDÁN</span>
        </div>

        {/* Main Content */}
        <main className="feed-main-area">
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
              <div className="action-buttons-container">
                <div className="action-buttons-row">
                  <div className="action-btn-wrapper">
                    <button className="action-btn action-btn-dislike" onClick={handleDislike}>✕</button>
                    <span className="action-btn-label">DESCARTAR</span>
                  </div>
                  
                  <div className="action-btn-wrapper" style={{marginTop: '10px'}}>
                    <button className="action-btn action-btn-info" onClick={() => {}}>i</button>
                    <span className="action-btn-label">DETALLE</span>
                  </div>

                  <div className="action-btn-wrapper" style={{marginTop: '10px'}}>
                    <button className="action-btn action-btn-super" onClick={() => {}}>★</button>
                    <span className="action-btn-label">SÚPER</span>
                  </div>

                  <div className="action-btn-wrapper">
                    <button className="action-btn action-btn-like" onClick={handleLike}>♥</button>
                    <span className="action-btn-label" style={{marginTop: '-2px'}}>ME GUSTA</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-emoji">🏁</div>
              <h2 className="empty-state-title">¡Ya viste todos!</h2>
              <p className="empty-state-text">
                No hay más vehículos por ahora.
              </p>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />

      </div>
    </div>
  );
}