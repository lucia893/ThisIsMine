import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreatePost.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "lost" as "lost" | "found",
    location: "",
    contact: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("contact", formData.contact);
      if (image) {
        formDataToSend.append("image", image);
      }

      const response = await axios.post(
        `${API_URL}/api/posts`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      navigate(`/post/${response.data.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "No se pudo crear la publicacion. Intentalo de nuevo.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="form-title">Reportar un objeto</h2>
      <p className="form-subtitle">
        Ayuda a la comunidad reportando un objeto perdido o encontrado
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="category">Categoria *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="lost">Objeto perdido</option>
            <option value="found">Objeto encontrado</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Titulo del objeto *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej.: iPhone 13 Pro negro"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripcion *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe el objeto en detalle..."
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Ubicacion</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Donde se perdio o encontro?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact">Informacion de contacto</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Correo o telefono"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Subir foto</label>
          <div className="image-upload">
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="file-input"
            />
            <span className="upload-text">
              {image ? image.name : "Haz clic para subir o arrastra una imagen"}
            </span>
          </div>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Vista previa" />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="remove-image-btn"
              >
                Quitar
              </button>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
