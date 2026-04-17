import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Dummy API for M5Stack Flip Event
  // In a real scenario, the M5Stack would POST to this endpoint
  let lastFlipEvent = { timestamp: 0, orientation: "none" };

  app.post("/api/m5stack/flip", (req, res) => {
    const { orientation } = req.body;
    lastFlipEvent = { timestamp: Date.now(), orientation };
    console.log("M5Stack Flip Event:", orientation);
    res.json({ status: "ok", received: orientation });
  });

  app.get("/api/m5stack/status", (req, res) => {
    res.json(lastFlipEvent);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
