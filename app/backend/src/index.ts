import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { config } from "./config";
import { initializeDatabase, mapPostRow, pool } from "./db";
import {
  getLocalUploadsDir,
  getStorageMode,
  removeImage,
  saveImage,
  upload,
} from "./storage";
import { PostRow } from "./types";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.corsAllowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    },
  }),
);
app.use(express.json());
app.use("/uploads", express.static(getLocalUploadsDir()));

function normalizeCategory(category: unknown): "lost" | "found" | null {
  if (category === "lost" || category === "found") {
    return category;
  }

  return null;
}

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

app.get(
  "/api/posts",
  asyncHandler(async (_req, res) => {
    const result = await pool.query<PostRow>(
      `
        SELECT id, title, description, category, image_url, image_key, location, contact, date_posted
        FROM posts
        ORDER BY date_posted DESC
      `,
    );

    res.json(result.rows.map(mapPostRow));
  }),
);

app.get(
  "/api/posts/:id",
  asyncHandler(async (req, res) => {
    const result = await pool.query<PostRow>(
      `
        SELECT id, title, description, category, image_url, image_key, location, contact, date_posted
        FROM posts
        WHERE id = $1
        LIMIT 1
      `,
      [req.params.id],
    );

    const post = result.rows[0];
    if (!post) {
      res.status(404).json({ error: "Publicacion no encontrada." });
      return;
    }

    res.json(mapPostRow(post));
  }),
);

app.post(
  "/api/posts",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const { title, description, location, contact } = req.body;
    const category = normalizeCategory(req.body.category);

    if (!title || !description || !category) {
      res.status(400).json({
        error: "Faltan campos obligatorios: title, description y category.",
      });
      return;
    }

    const postId = randomUUID();
    const uploadedImage = await saveImage(req.file);

    const result = await pool.query<PostRow>(
      `
        INSERT INTO posts (id, title, description, category, location, contact, image_url, image_key)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, title, description, category, image_url, image_key, location, contact, date_posted
      `,
      [
        postId,
        title.trim(),
        description.trim(),
        category,
        typeof location === "string" ? location.trim() : "",
        typeof contact === "string" ? contact.trim() : "",
        uploadedImage?.imageUrl || null,
        uploadedImage?.imageKey || null,
      ],
    );

    res.status(201).json(mapPostRow(result.rows[0]));
  }),
);

app.put(
  "/api/posts/:id",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const existingResult = await pool.query<PostRow>(
      `
        SELECT id, title, description, category, image_url, image_key, location, contact, date_posted
        FROM posts
        WHERE id = $1
        LIMIT 1
      `,
      [req.params.id],
    );

    const existingPost = existingResult.rows[0];
    if (!existingPost) {
      res.status(404).json({ error: "Publicacion no encontrada." });
      return;
    }

    const nextCategory =
      req.body.category !== undefined
        ? normalizeCategory(req.body.category)
        : existingPost.category;

    if (!nextCategory) {
      res.status(400).json({ error: "La categoria debe ser lost o found." });
      return;
    }

    const newImage = req.file ? await saveImage(req.file) : null;

    const result = await pool.query<PostRow>(
      `
        UPDATE posts
        SET
          title = $2,
          description = $3,
          category = $4,
          location = $5,
          contact = $6,
          image_url = $7,
          image_key = $8
        WHERE id = $1
        RETURNING id, title, description, category, image_url, image_key, location, contact, date_posted
      `,
      [
        req.params.id,
        typeof req.body.title === "string"
          ? req.body.title.trim()
          : existingPost.title,
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : existingPost.description,
        nextCategory,
        typeof req.body.location === "string"
          ? req.body.location.trim()
          : existingPost.location,
        typeof req.body.contact === "string"
          ? req.body.contact.trim()
          : existingPost.contact,
        newImage?.imageUrl || existingPost.image_url,
        newImage?.imageKey || existingPost.image_key,
      ],
    );

    if (newImage && existingPost.image_key) {
      await removeImage(existingPost.image_key);
    }

    res.json(mapPostRow(result.rows[0]));
  }),
);

app.delete(
  "/api/posts/:id",
  asyncHandler(async (req, res) => {
    const result = await pool.query<PostRow>(
      `
        DELETE FROM posts
        WHERE id = $1
        RETURNING id, title, description, category, image_url, image_key, location, contact, date_posted
      `,
      [req.params.id],
    );

    const deletedPost = result.rows[0];
    if (!deletedPost) {
      res.status(404).json({ error: "Publicacion no encontrada." });
      return;
    }

    await removeImage(deletedPost.image_key);
    res.json(mapPostRow(deletedPost));
  }),
);

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    await pool.query("SELECT 1");

    res.json({
      status: "OK",
      database: "connected",
      storage: getStorageMode(),
    });
  }),
);

app.use(
  (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    console.error(error);
    res.status(500).json({ error: message });
  },
);

initializeDatabase()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server listening on ${config.backendPublicUrl}`);
      console.log(`Database ready. Storage mode: ${getStorageMode()}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
