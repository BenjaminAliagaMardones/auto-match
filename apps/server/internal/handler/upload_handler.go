package handler

import (
	"errors"
	"fmt"
	"net/http"
	"path"

	"github.com/BenjaminAliagaMardones/automatch/internal/handler/dto"
	"github.com/BenjaminAliagaMardones/automatch/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const maxImageSize = 5 << 20 // 5 MiB

// allowedImageTypes mapea content-type permitido -> extensión del objeto.
var allowedImageTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

type UploadHandler struct {
	store storage.ObjectStorage
}

func NewUploadHandler(store storage.ObjectStorage) *UploadHandler {
	return &UploadHandler{store: store}
}

// UploadImage godoc
// @Summary      Subir imagen al bucket
// @Description  Sube una imagen (jpeg/png/webp, máx 5MB) y devuelve su URL pública para usar en photo_urls.
// @Tags         uploads
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        image  formData  file  true  "Archivo de imagen"
// @Success      201  {object}  dto.UploadImageResponse
// @Failure      400  {object}  dto.ErrorResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      413  {object}  dto.ErrorResponse  "Imagen supera los 5MB"
// @Router       /uploads/images [post]
func (h *UploadHandler) UploadImage(c *gin.Context) {
	// Cortar el body ANTES de parsear el multipart: sin esto, FormFile
	// consume el upload completo (p.ej. 2GB) antes de poder rechazarlo.
	// Margen extra para los headers del multipart.
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxImageSize+(64<<10))

	fileHeader, err := c.FormFile("image")
	if err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			c.JSON(http.StatusRequestEntityTooLarge, dto.ErrorResponse{Error: "la imagen no puede superar los 5MB"})
			return
		}
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "se requiere el campo 'image' (multipart/form-data)"})
		return
	}
	if fileHeader.Size > maxImageSize {
		c.JSON(http.StatusRequestEntityTooLarge, dto.ErrorResponse{Error: "la imagen no puede superar los 5MB"})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	defer file.Close()

	// Detectar el content-type real desde los bytes, no confiar en el header.
	head := make([]byte, 512)
	n, err := file.Read(head)
	if err != nil && n == 0 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "archivo vacío o ilegible"})
		return
	}
	contentType := http.DetectContentType(head[:n])
	ext, ok := allowedImageTypes[contentType]
	if !ok {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: fmt.Sprintf("tipo de archivo no permitido (%s); usa jpeg, png o webp", contentType)})
		return
	}
	if _, err := file.Seek(0, 0); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}

	objectName := path.Join("listings", uuid.NewString()+ext)
	url, err := h.store.Upload(c.Request.Context(), objectName, file, fileHeader.Size, contentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "no se pudo guardar la imagen"})
		return
	}

	c.JSON(http.StatusCreated, dto.UploadImageResponse{URL: url})
}
