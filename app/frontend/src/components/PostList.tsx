import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Post } from "../types";
import axios from "axios";
import "./PostList.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/posts`);
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar las publicaciones:", error);
      setLoading(false);
    }
  };

  const filteredPosts =
    filter === "all" ? posts : posts.filter((post) => post.category === filter);

  if (loading) {
    return <div className="loading">Cargando publicaciones...</div>;
  }

  return (
    <div className="post-list-container">
      <h2 className="section-title">Publicaciones de la comunidad</h2>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todas
        </button>
        <button
          className={`filter-btn ${filter === "lost" ? "active" : ""}`}
          onClick={() => setFilter("lost")}
        >
          Perdidos
        </button>
        <button
          className={`filter-btn ${filter === "found" ? "active" : ""}`}
          onClick={() => setFilter("found")}
        >
          Encontrados
        </button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <p>No hay publicaciones. Ayuda a otros reportando un objeto.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <Link
              to={`/post/${post.id}`}
              key={post.id}
              className="post-card-link"
            >
              <div className="post-card">
                {post.image && (
                  <div className="post-image">
                    <img src={post.image} alt={post.title} />
                  </div>
                )}
                <div className="post-content">
                  <div className="post-header">
                    <h3>{post.title}</h3>
                    <span className={`badge badge-${post.category}`}>
                      {post.category === "lost" ? "Perdido" : "Encontrado"}
                    </span>
                  </div>
                  <p className="post-description">
                    {post.description.substring(0, 100)}...
                  </p>
                  {post.location && (
                    <p className="post-location">Ubicacion: {post.location}</p>
                  )}
                  <p className="post-date">
                    {new Date(post.datePosted).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostList;
