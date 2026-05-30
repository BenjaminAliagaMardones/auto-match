import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';

export default function NewListing() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    vehicle_type: 'SEDÁN',
    description: '',
    photo_url: '' // We will convert this to an array for the API
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        price: parseInt(formData.price, 10),
        vehicle_type: formData.vehicle_type,
        description: formData.description,
        photo_urls: formData.photo_url ? [formData.photo_url] : []
      };

      await apiClient.post('listings', { json: payload }).json();
      
      // Success: Navigate back to the seller dashboard
      navigate('/app/listings');
    } catch (err) {
      console.error("Error creating listing", err);
      setError("Ocurrió un error al publicar el auto. Verifica los datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="chat-header" style={{ borderBottom: '1px solid var(--gray-light)' }}>
        <button className="chat-back-btn" onClick={() => navigate('/app/listings')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="chat-header-info">
          <h2 className="chat-name">Publicar Auto</h2>
        </div>
        <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
      </header>

      <main className="feed-main-area" style={{ alignItems: 'stretch', padding: '1.5rem', overflowY: 'auto', backgroundColor: '#fff' }}>
        {error && <div className="form-error" style={{ color: 'red', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="new-listing-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="brand" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Marca *</label>
            <input 
              type="text" 
              id="brand" 
              name="brand" 
              value={formData.brand} 
              onChange={handleChange} 
              required 
              placeholder="Ej. Toyota"
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="model" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Modelo *</label>
            <input 
              type="text" 
              id="model" 
              name="model" 
              value={formData.model} 
              onChange={handleChange} 
              required 
              placeholder="Ej. Corolla XSE"
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label htmlFor="year" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Año</label>
              <input 
                type="number" 
                id="year" 
                name="year" 
                value={formData.year} 
                onChange={handleChange} 
                min="1950"
                max={new Date().getFullYear() + 1}
                placeholder="2024"
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label htmlFor="price" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Precio (USD) *</label>
              <input 
                type="number" 
                id="price" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                min="1"
                placeholder="15000"
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="vehicle_type" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tipo de Vehículo</label>
            <select 
              id="vehicle_type" 
              name="vehicle_type" 
              value={formData.vehicle_type} 
              onChange={handleChange}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff' }}
            >
              <option value="SEDÁN">Sedán</option>
              <option value="SUV">SUV</option>
              <option value="HATCHBACK">Hatchback</option>
              <option value="PICKUP">Pick-up</option>
              <option value="COUPÉ">Coupé</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="photo_url" style={{ fontWeight: 600, fontSize: '0.9rem' }}>URL de la Foto *</label>
            <input 
              type="url" 
              id="photo_url" 
              name="photo_url" 
              value={formData.photo_url} 
              onChange={handleChange} 
              required 
              placeholder="https://ejemplo.com/mifoto.jpg"
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="description" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Descripción</label>
            <textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="4"
              placeholder="Detalles sobre el vehículo..."
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              padding: '1rem',
              backgroundColor: 'var(--charcoal)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '1rem',
              marginTop: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Auto'}
          </button>
        </form>
      </main>
    </>
  );
}
