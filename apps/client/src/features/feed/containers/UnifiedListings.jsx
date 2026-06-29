import { useNavigate } from 'react-router-dom';
import { useSellerListings } from '../hooks/useSellerListings';

const StatusBadge = ({ status }) => {
  const config = {
    active: { label: 'Activo', className: 'seller-status-active' },
    paused: { label: 'Pausado', className: 'seller-status-paused' },
    sold: { label: 'Vendido', className: 'seller-status-sold' },
  };
  const c = config[status] || config.active;
  return <span className={`seller-status-badge ${c.className}`}>{c.label}</span>;
};

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { listings, isLoading, activeCount, soldCount, totalCount } = useSellerListings();

  return (
    <>
      {/* Header */}
      <header className="feed-top-nav" style={{ paddingBottom: '1rem' }}>
        <div>
          <span className="feed-location-text">PANEL VENDEDOR</span>
          <h1 className="feed-header-title" style={{ fontSize: '2rem' }}>
            Mis Autos
          </h1>
        </div>
        <button
          className="seller-add-btn"
          onClick={() => navigate('/seller/listings/new')}
          aria-label="Publicar auto"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </header>

      <main
        className="feed-main-area"
        style={{ alignItems: 'stretch', marginTop: 0, overflowY: 'auto', padding: '0 1rem' }}
      >
        {/* Stats Summary */}
        <div className="seller-stats-row">
          <div className="seller-stat-card">
            <span className="seller-stat-number">{activeCount}</span>
            <span className="seller-stat-label">Activos</span>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-number">{soldCount}</span>
            <span className="seller-stat-label">Vendidos</span>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-number">{totalCount}</span>
            <span className="seller-stat-label">Total</span>
          </div>
        </div>

        {/* Listings List */}
        <div className="seller-listings-list">
          {isLoading ? (
            <div className="seller-empty-state">
              <p>Cargando publicaciones...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="seller-empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚗</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sin publicaciones aún</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                ¡Publica tu primer auto y empieza a recibir interesados!
              </p>
              <button
                className="btn-primary"
                style={{ maxWidth: '250px' }}
                onClick={() => navigate('/seller/listings/new')}
              >
                Publicar mi primer auto
              </button>
            </div>
          ) : (
            listings.map((listing) => (
              <div key={listing.id} className="seller-listing-card">
                <div className="seller-listing-photo">
                  {listing.photos && listing.photos.length > 0 ? (
                    <img src={listing.photos[0].url} alt={`${listing.brand} ${listing.model}`} />
                  ) : (
                    <div className="seller-listing-photo-placeholder">
                      {listing.brand?.substring(0, 1) || '?'}
                    </div>
                  )}
                </div>
                <div className="seller-listing-info">
                  <div className="seller-listing-header">
                    <h3 className="seller-listing-title">
                      {listing.brand} {listing.model}
                    </h3>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="seller-listing-details">
                    {listing.year ? `${listing.year} · ` : ''}
                    {listing.price?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
