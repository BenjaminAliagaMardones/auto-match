import { motion, useMotionValue, useTransform } from 'framer-motion';

const CarSilhouette = () => (
  <svg viewBox="0 0 200 100" className="swipe-card-car-shape" fill="currentColor">
    <path d="M160.7,39.6c-4.4-8.8-12-16-21.4-19.4L112,11.5c-4.9-1.8-10.1-2.7-15.4-2.7H66.2C54.4,8.8,44,15,37.3,25.2L24,45.4 c-4.6,7-12,12-20,13.7c-0.6,0.1-1,0.6-1,1.2v18c0,2.2,1.8,4,4,4h13.2c1.9,6,7.5,10.4,14.2,10.4s12.3-4.3,14.2-10.4H147 c1.9,6,7.5,10.4,14.2,10.4c6.7,0,12.3-4.3,14.2-10.4h11.6c2.2,0,4-1.8,4-4v-11.8c0-8.6-4.5-16.5-11.8-21L160.7,39.6z M34.4,78.3 c-4,0-7.3-3.3-7.3-7.3s3.3-7.3,7.3-7.3s7.3,3.3,7.3,7.3S38.4,78.3,34.4,78.3z M161.2,78.3c-4,0-7.3-3.3-7.3-7.3s3.3-7.3,7.3-7.3 s7.3,3.3,7.3,7.3S165.2,78.3,161.2,78.3z M66.2,14.8h30.4c3.4,0,6.7,0.6,9.8,1.8L130,24.8c4.6,1.7,8.4,5.1,10.7,9.3l7,13 c-36.9-1-105-1-105-1L52.5,29C55.7,24,60.8,20.8,66.2,14.8z" />
  </svg>
);

const normalizeItem = ({ item, car }) => {
  if (item) {
    return item;
  }

  return {
    type: 'vehicle',
    id: `vehicle-${car.id}`,
    vehicle: car,
  };
};

const VehicleCardContent = ({ vehicle, compact = false }) => (
  <>
    <div className="swipe-card-image-area">
      {!compact && (
        <div className="swipe-card-top-tags">
          <div className="swipe-card-view-tag">{vehicle.viewType}</div>
          <div className="swipe-card-match-badge">
            <span className="swipe-card-match-number">{vehicle.match}</span>
            <span className="swipe-card-match-text">MATCH</span>
          </div>
        </div>
      )}

      <CarSilhouette />

      <div className="swipe-card-name-overlay">
        {!compact && (
          <div className="swipe-card-make">{vehicle.make} - <span style={{ opacity: 0.8 }}>{vehicle.year}</span></div>
        )}
        <h2 className="swipe-card-model">{vehicle.model}</h2>
      </div>
    </div>

    <div className="swipe-card-info-panel">
      {compact ? (
        <h3 className="swipe-card-model">{vehicle.model}</h3>
      ) : (
        <>
          <div className="swipe-card-price-row">
            <div className="swipe-card-price">{vehicle.price}</div>
            <div className="swipe-card-type-badge">{vehicle.type}</div>
          </div>
          <div className="swipe-card-details-text">
            {vehicle.km} · <span style={{ textTransform: 'lowercase' }}>{vehicle.transmission}</span><br />
            {vehicle.location}
          </div>
        </>
      )}
    </div>
  </>
);

const AdCardContent = ({ ad, compact = false }) => (
  <>
    <div className="swipe-card-image-area swipe-card-ad-image-area">
      <div className="swipe-card-top-tags">
        <div className="swipe-card-view-tag">{ad.visualLabel}</div>
        <div className="swipe-card-match-badge swipe-card-ad-badge">
          <span className="swipe-card-match-text">AD</span>
        </div>
      </div>

      <div className="swipe-card-ad-visual">
        <span>{ad.category}</span>
      </div>

      <div className="swipe-card-name-overlay">
        <div className="swipe-card-make">{ad.brand}</div>
        <h2 className="swipe-card-model">{ad.title}</h2>
      </div>
    </div>

    <div className="swipe-card-info-panel">
      {compact ? (
        <h3 className="swipe-card-model">{ad.title}</h3>
      ) : (
        <>
          <div className="swipe-card-price-row">
            <div className="swipe-card-price swipe-card-ad-cta">{ad.callToAction}</div>
            <div className="swipe-card-type-badge">{ad.category}</div>
          </div>
          <div className="swipe-card-details-text">
            {ad.description}
          </div>
        </>
      )}
    </div>
  </>
);

const SwipeCardContent = ({ item, compact }) => {
  if (item.type === 'ad') {
    return <AdCardContent ad={item.ad} compact={compact} />;
  }

  return <VehicleCardContent vehicle={item.vehicle} compact={compact} />;
};

export default function SwipeCard({ car, item, onSwipe, isTop, exitDirectionRef }) {
  const feedItem = normalizeItem({ item, car });
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const isAd = feedItem.type === 'ad';
  const rightOverlayText = isAd ? 'VER ANUNCIO' : 'LIKE';
  const leftOverlayText = isAd ? 'SKIP' : 'NOPE';

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
        className={`swipe-card ${isAd ? 'swipe-card-ad' : ''}`}
        style={{ scale: 0.95, y: 15 }}
        initial={false}
      >
        <SwipeCardContent item={feedItem} compact />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`swipe-card ${isAd ? 'swipe-card-ad' : ''}`}
      style={{ x, rotate, zIndex: 10 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      exit={() => {
        const direction = exitDirectionRef?.current;
        return {
          x: direction === 'like' ? 400 : direction === 'dislike' ? -400 : x.get() > 0 ? 400 : -400,
          opacity: 0,
          zIndex: 20,
          transition: { duration: 0.3 },
        };
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div className="swipe-overlay swipe-overlay-like" style={{ opacity: likeOpacity }}>
        <span className="swipe-overlay-text">{rightOverlayText}</span>
      </motion.div>

      <motion.div className="swipe-overlay swipe-overlay-nope" style={{ opacity: nopeOpacity }}>
        <span className="swipe-overlay-text">{leftOverlayText}</span>
      </motion.div>

      <SwipeCardContent item={feedItem} />
    </motion.div>
  );
}
