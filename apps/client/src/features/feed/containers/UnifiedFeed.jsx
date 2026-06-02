import { AnimatePresence } from 'framer-motion';
import SwipeCard from '../components/SwipeCard';
import { useBuyerFeed } from '../hooks/useBuyerFeed';

export default function BuyerFeed() {
  const {
    currentItem,
    nextItem,
    handleSwipe,
    handleLike,
    handleDislike,
    exitDirectionRef,
  } = useBuyerFeed();

  const isVehicleSlide = currentItem?.type === 'vehicle';

  return (
    <>
      {/* Top Navigation / Header */}
      <header className="feed-top-nav">
        <div className="feed-location-info">
          <span className="feed-location-text">AUTOMATCH · TEMUCO</span>
          <span className="feed-location-text" style={{ opacity: 0.6 }}>+150KM</span>
          <h1 className="feed-header-title">Tu <span className="feed-header-title-italic">match</span> de<br />hoy</h1>
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
        <span className="feed-filter-tag" style={{ borderBottom: '2px solid var(--charcoal)', paddingBottom: '4px' }}>SEDÁN</span>
      </div>

      {/* Main Content */}
      <main className="feed-main-area">
        {currentItem ? (
          <>
            {/* Card Stack */}
            <div className="card-stack">
              <AnimatePresence>
                {nextItem && (
                  <SwipeCard
                    key={nextItem.id}
                    item={nextItem}
                    onSwipe={() => {}}
                    isTop={false}
                  />
                )}
                {currentItem && (
                  <SwipeCard
                    key={currentItem.id}
                    item={currentItem}
                    onSwipe={handleSwipe}
                    isTop={true}
                    exitDirectionRef={exitDirectionRef}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            {isVehicleSlide && (
              <div className="action-buttons-container">
                <div className="action-buttons-row">
                  <div className="action-btn-wrapper">
                    <button className="action-btn action-btn-dislike" onClick={handleDislike}>✕</button>
                    <span className="action-btn-label">DESCARTAR</span>
                  </div>

                  <div className="action-btn-wrapper" style={{ marginTop: '10px' }}>
                    <button className="action-btn action-btn-info" onClick={() => {}}>i</button>
                    <span className="action-btn-label">DETALLE</span>
                  </div>

                  <div className="action-btn-wrapper" style={{ marginTop: '10px' }}>
                    <button className="action-btn action-btn-super" onClick={() => {}}>★</button>
                    <span className="action-btn-label">SÚPER</span>
                  </div>

                  <div className="action-btn-wrapper">
                    <button className="action-btn action-btn-like" onClick={handleLike}>♥</button>
                    <span className="action-btn-label" style={{ marginTop: '-2px' }}>ME GUSTA</span>
                  </div>
                </div>
              </div>
            )}
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
    </>
  );
}
