import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, getCategoryLabel } from "../api";
import "./CreatePost.css";

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
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("location", formData.location.trim());
      formDataToSend.append("contact", formData.contact.trim());
      if (image) {
        formDataToSend.append("image", image);
      }

      const response = await axios.post(`${API_URL}/api/posts`, formDataToSend);

      navigate(`/post/${response.data.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "No se pudo crear la publicacion. Intentalo de nuevo.",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="create-post-container">
      <h2 className="form-title">Publicar un robo</h2>
      <p className="form-subtitle">
        Comparti lo que te robaron o avisa si un objeto ya fue recuperado.
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="category">Estado *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="lost">{getCategoryLabel("lost")}</option>
            <option value="found">{getCategoryLabel("found")}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Que te robaron *</label>
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
            placeholder="Conta que paso, como era el objeto y cualquier dato que ayude..."
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Zona</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Donde fue el robo o donde aparecio despues?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact">Contacto</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Correo, telefono o Instagram"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Foto</label>
          <label htmlFor="image" className="image-upload">
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="file-input"
            />
            <span className="upload-text">
              {image ? image.name : "Toca aca para subir una foto"}
            </span>
          </label>
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
          {loading ? "Publicando..." : "Publicar denuncia"}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
