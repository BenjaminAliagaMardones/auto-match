import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SwipeCard from '../components/SwipeCard';
import { useBuyerFeed } from '../hooks/useBuyerFeed';

export default function BuyerFeed() {
  const navigate = useNavigate();
  const {
    currentCar,
    nextCar,
    isLoading,
    error,
    newMatch,
    dismissMatch,
    handleSwipe,
    handleLike,
    handleDislike,
    exitDirectionRef,
  } = useBuyerFeed();

  const openMatchChat = () => {
    const { matchId, car } = newMatch;
    dismissMatch();
    navigate(`/app/chat/${matchId}`, {
      state: { matchName: `${car.make} ${car.model}` },
    });
  };

  return (
    <>
      {/* Top Navigation / Header */}
      <header className="feed-top-nav">
        <div className="feed-location-info">
          <span className="feed-location-text">AUTOMATCH · TEMUCO</span>
          <h1 className="feed-header-title">
            Tu <span className="feed-header-title-italic">match</span> de
            <br />
            hoy
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="feed-main-area">
        {isLoading ? (
          <div className="empty-state">
            <div className="feed-spinner" aria-label="Cargando" />
            <p className="empty-state-text">Buscando autos para ti…</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-emoji">😕</div>
            <h2 className="empty-state-title">No pudimos cargar el feed</h2>
            <p className="empty-state-text">Revisa tu conexión e intenta de nuevo.</p>
            <button className="feed-retry-btn" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        ) : currentCar ? (
          <>
            {/* Card Stack */}
            <div className="card-stack">
              <AnimatePresence>
                {nextCar && (
                  <SwipeCard key={nextCar.id} car={nextCar} onSwipe={() => {}} isTop={false} />
                )}
                {currentCar && (
                  <SwipeCard
                    key={currentCar.id}
                    car={currentCar}
                    onSwipe={handleSwipe}
                    isTop={true}
                    exitDirectionRef={exitDirectionRef}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons-container">
              <div className="action-buttons-row">
                <div className="action-btn-wrapper">
                  <button
                    className="action-btn action-btn-dislike"
                    onClick={handleDislike}
                    aria-label="Descartar"
                  >
                    ✕
                  </button>
                  <span className="action-btn-label">DESCARTAR</span>
                </div>

                <div className="action-btn-wrapper">
                  <button
                    className="action-btn action-btn-like"
                    onClick={handleLike}
                    aria-label="Me gusta"
                  >
                    ♥
                  </button>
                  <span className="action-btn-label" style={{ marginTop: '-2px' }}>
                    ME GUSTA
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-emoji">🏁</div>
            <h2 className="empty-state-title">¡Ya viste todos!</h2>
            <p className="empty-state-text">No hay más vehículos por ahora.</p>
          </div>
        )}
      </main>

      {/* Overlay de match nuevo */}
      <AnimatePresence>
        {newMatch && (
          <motion.div
            className="match-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-label="Nuevo match"
          >
            <motion.div
              className="match-overlay-card"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              {newMatch.car.photo && (
                <img
                  className="match-overlay-photo"
                  src={newMatch.car.photo}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <h2 className="match-overlay-title">¡Es un match!</h2>
              <p className="match-overlay-text">
                Al vendedor de <strong>{`${newMatch.car.make} ${newMatch.car.model}`}</strong> le
                interesa hablar contigo.
              </p>
              <button className="match-overlay-cta" onClick={openMatchChat}>
                Enviar mensaje
              </button>
              <button className="match-overlay-dismiss" onClick={dismissMatch}>
                Seguir explorando
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
