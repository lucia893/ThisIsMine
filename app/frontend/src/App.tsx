import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PostList from "./components/PostList";
import CreatePost from "./components/CreatePost";
import PostDetail from "./components/PostDetail";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <h1 className="logo">Me robaron</h1>
            <nav className="nav">
              <Link to="/" className="nav-link">
                Casos publicados
              </Link>
              <Link to="/create" className="nav-link btn-create">
                Publicar robo
              </Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>
            &copy; 2026 Me robaron. Un espacio para visibilizar robos y ayudar a
            recuperar pertenencias.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
