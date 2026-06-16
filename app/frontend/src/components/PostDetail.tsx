import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Post } from "../types";
import axios from "axios";
import { API_URL, getCategoryLabel } from "../api";
import "./PostDetail.css";

function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/posts/${id}`);
        setPost(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "No se pudo cargar la publicacion",
        );
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Seguro que quieres eliminar esta publicacion?")) {
      try {
        await axios.delete(`${API_URL}/api/posts/${id}`);
        navigate("/");
      } catch (err) {
        console.error("Error al eliminar la publicacion:", err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Cargando publicacion...</div>;
  }

  if (error || !post) {
    return (
      <div className="error-container">
        <p>{error || "Publicacion no encontrada"}</p>
        <Link to="/" className="back-link">
          Volver a casos
        </Link>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <Link to="/" className="back-link">
        Volver a casos
      </Link>

      <div className="post-detail">
        {post.image && (
          <div className="post-detail-image">
            <img src={post.image} alt={post.title} />
          </div>
        )}

        <div className="post-detail-content">
          <div className="post-detail-header">
            <div>
              <h1>{post.title}</h1>
              <span className={`badge badge-${post.category}`}>
                {getCategoryLabel(post.category)}
              </span>
            </div>
          </div>

          <div className="post-details-grid">
            <div className="detail-item">
              <label>Estado:</label>
              <p>{getCategoryLabel(post.category)}</p>
            </div>

            <div className="detail-item">
              <label>Publicado:</label>
              <p>{new Date(post.datePosted).toLocaleString("es-ES")}</p>
            </div>

            {post.location && (
              <div className="detail-item">
                <label>Zona:</label>
                <p>{post.location}</p>
              </div>
            )}

            {post.contact && (
              <div className="detail-item">
                <label>Contacto:</label>
                <p>{post.contact}</p>
              </div>
            )}
          </div>

          <div className="post-description-section">
            <h2>Descripcion</h2>
            <p>{post.description}</p>
          </div>

          <div className="action-buttons">
            <button onClick={handleDelete} className="delete-btn">
              Eliminar publicacion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
