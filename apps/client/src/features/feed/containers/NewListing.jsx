import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';

export default function NewListing() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    vehicle_type: 'SEDÁN',
    description: '',
    photo_url: '',
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
        photo_urls: [formData.photo_url],
      };
      await apiClient.post('listings', { json: payload }).json();
      navigate('/app/listings');
    } catch (err) {
      console.error('Error creating listing', err);
      setError('Ocurrió un error al publicar el auto. Verifica los datos.');
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
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="feed-main-area new-listing-main">
        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="new-listing-form">

          <div className="form-group">
            <label htmlFor="brand" className="form-label">Marca *</label>
            <input
              type="text" id="brand" name="brand"
              value={formData.brand} onChange={handleChange}
              required placeholder="Ej. Toyota"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model" className="form-label">Modelo *</label>
            <input
              type="text" id="model" name="model"
              value={formData.model} onChange={handleChange}
              required placeholder="Ej. Corolla XSE"
              className="form-input"
            />
          </div>

          <div className="new-listing-row">
            <div className="form-group">
              <label htmlFor="year" className="form-label">Año</label>
              <input
                type="number" id="year" name="year"
                value={formData.year} onChange={handleChange}
                min="1950" max={new Date().getFullYear() + 1}
                placeholder="2024"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="price" className="form-label">Precio (USD) *</label>
              <input
                type="number" id="price" name="price"
                value={formData.price} onChange={handleChange}
                required min="1" placeholder="15000"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="vehicle_type" className="form-label">Tipo de Vehículo</label>
            <select
              id="vehicle_type" name="vehicle_type"
              value={formData.vehicle_type} onChange={handleChange}
              className="form-input"
            >
              <option value="SEDÁN">Sedán</option>
              <option value="SUV">SUV</option>
              <option value="HATCHBACK">Hatchback</option>
              <option value="PICKUP">Pick-up</option>
              <option value="COUPÉ">Coupé</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="photo_url" className="form-label">URL de la Foto *</label>
            <input
              type="url" id="photo_url" name="photo_url"
              value={formData.photo_url} onChange={handleChange}
              required placeholder="https://ejemplo.com/mifoto.jpg"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Descripción</label>
            <textarea
              id="description" name="description"
              value={formData.description} onChange={handleChange}
              rows="4" placeholder="Detalles sobre el vehículo..."
              className="form-input new-listing-textarea"
            ></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary new-listing-submit">
            {isSubmitting ? 'Publicando...' : 'Publicar Auto'}
          </button>
        </form>
      </main>
    </>
  );
}
