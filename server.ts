import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json());

  // WebSocket Setup
  const wss = new WebSocketServer({ server, path: "/ws" });
  
  const clients = new Set<WebSocket>();
  const devices = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Browser/Device client connected. Total:", clients.size);
    
    ws.on("close", () => {
      clients.delete(ws);
      if (devices.has(ws)) {
        devices.delete(ws);
        broadcast({ type: "device_status", connected: devices.size > 0 });
      }
    });

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "handshake") {
          console.log("Handshake received from:", data.client_type);
          if (data.client_type === "device") {
            devices.add(ws);
            broadcast({ type: "device_status", connected: true });
          }
          // Send current status to the new client
          ws.send(JSON.stringify({ type: "device_status", connected: devices.size > 0 }));
        }
        if (data.type === "ping" && devices.has(ws)) {
           // Keepalive from device
        }
      } catch (e) {}
    });
  });

  const broadcast = (data: any) => {
    const payload = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  };

  // M5Stack Event Endpoint
  app.post("/device/orientation", (req, res) => {
    const { deviceId, orientation, event } = req.body;
    console.log(`M5Stack Event [${deviceId}]: ${event} -> ${orientation}`);
    
    // Broadcast to all connected browser clients
    broadcast({
      type: "orientation",
      deviceId,
      orientation, // "study", "exercise", "rest"
      timestamp: Date.now()
    });

    res.json({ status: "ok" });
  });

  // Legacy/Sim SDK endpoints
  app.post("/api/m5stack/flip", (req, res) => {
    const { orientation } = req.body;
    broadcast({ type: "orientation", orientation: orientation === "down" ? "study" : "rest" });
    res.json({ status: "ok" });
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

  app.get("/api/m5stack/status", (req, res) => {
    res.json({ status: "ok", active: clients.size });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
