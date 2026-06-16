import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Post } from "../types";
import axios from "axios";
import { API_URL, getCategoryLabel } from "../api";
import "./PostList.css";

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
    return <div className="loading">Cargando casos...</div>;
  }

  return (
    <div className="post-list-container">
      <h2 className="section-title">Robos y recuperaciones reportadas</h2>

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
          Robados
        </button>
        <button
          className={`filter-btn ${filter === "found" ? "active" : ""}`}
          onClick={() => setFilter("found")}
        >
          Recuperados
        </button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <p>No hay casos todavia. Publica uno para que mas gente lo vea.</p>
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
                      {getCategoryLabel(post.category)}
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
