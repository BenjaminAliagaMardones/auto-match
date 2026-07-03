import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';
import { uploadImage, MAX_IMAGE_SIZE } from '../../../services/uploads';

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
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Liberar las previews anteriores antes de generar las nuevas
    previews.forEach((u) => URL.revokeObjectURL(u));

    const tooBig = files.find((f) => f.size > MAX_IMAGE_SIZE);
    if (tooBig) {
      setError(`"${tooBig.name}" supera los 5MB permitidos.`);
      e.target.value = '';
      setPhotoFiles([]);
      setPreviews([]);
      return;
    }
    setError(null);
    setPhotoFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (photoFiles.length === 0) {
      setError('Selecciona al menos una foto del vehículo.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Subir las fotos al bucket y obtener sus URLs públicas
      const photoUrls = [];
      for (const file of photoFiles) {
        photoUrls.push(await uploadImage(file));
      }

      // 2. Crear el listing con las URLs del bucket
      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        price: parseInt(formData.price, 10),
        vehicle_type: formData.vehicle_type,
        description: formData.description,
        photo_urls: photoUrls,
      };

      await apiClient.post('listings', { json: payload }).json();

      // Success: Navigate back to the seller dashboard
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="chat-header-info">
          <h2 className="chat-name">Publicar Auto</h2>
        </div>
        <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
      </header>

      <main
        className="feed-main-area"
        style={{
          alignItems: 'stretch',
          padding: '1.5rem',
          overflowY: 'auto',
          backgroundColor: '#fff',
        }}
      >
        {error && (
          <div
            className="form-error"
            style={{ color: 'red', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee' }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="new-listing-form"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div
            className="form-group"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label htmlFor="brand" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Marca *
            </label>
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

          <div
            className="form-group"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label htmlFor="model" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Modelo *
            </label>
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
            <div
              className="form-group"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}
            >
              <label htmlFor="year" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Año
              </label>
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
            <div
              className="form-group"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}
            >
              <label htmlFor="price" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Precio (USD) *
              </label>
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

          <div
            className="form-group"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label htmlFor="vehicle_type" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Tipo de Vehículo
            </label>
            <select
              id="vehicle_type"
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleChange}
              style={{
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
              }}
            >
              <option value="SEDÁN">Sedán</option>
              <option value="SUV">SUV</option>
              <option value="HATCHBACK">Hatchback</option>
              <option value="PICKUP">Pick-up</option>
              <option value="COUPÉ">Coupé</option>
            </select>
          </div>

          <div
            className="form-group"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label htmlFor="photos" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Fotos * (jpeg, png o webp — máx 5MB c/u)
            </label>
            <input
              type="file"
              id="photos"
              name="photos"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFilesChange}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
            />
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {previews.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt="Vista previa"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            className="form-group"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label htmlFor="description" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Detalles sobre el vehículo..."
              style={{
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                resize: 'vertical',
              }}
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
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Subiendo fotos y publicando...' : 'Publicar Auto'}
          </button>
        </form>
      </main>
    </>
  );
}
