import express, { Request, Response } from "express";
import dotenv from "dotenv";
import accountRoutes from "./routes/account.routes";
import authRoutes from "./routes/auth.routes";
import swaggerUi from "swagger-ui-express";
import cors from "./config/cors";
import { specs } from "./config/swagger";
import profileRoutes from "./routes/profile.routes";
import metaDataRoutes from "./routes/metaData.routes";
import logger from "./config/logger";
import path from "path";
import fs from "fs";
import stripeRoutes from "./routes/stripe.routes";
import { handleWebhookEvent } from "./controllers/stripe.controller";

// Ensure directory structure exists for persistent disk storage
const isRenderEnvironment = process.env.RENDER === 'true';
const baseStoragePath = isRenderEnvironment ? '/photos' : path.join(__dirname, '../uploads');

// Helper function to ensure directory exists with proper permissions
const ensureDirectoryExists = (dirPath: string) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
      logger.info(`Created directory: ${dirPath}`);
    }
  } catch (error) {
    logger.error(`Error creating directory ${dirPath}:`, error);
  }
};

// Create necessary directory structure
try {
  ensureDirectoryExists(baseStoragePath);
  
  // Create common subdirectories for better organization
  ensureDirectoryExists(path.join(baseStoragePath, 'accounts'));
  ensureDirectoryExists(path.join(baseStoragePath, 'temp'));
  
  logger.info(`Storage configured at: ${baseStoragePath}`);
} catch (error) {
  logger.error('Error configuring storage directories:', error);
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
// Middleware
app.use(cors);
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhookEvent
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve photos from persistent disk storage
// Use /photos route to serve files from the mounted persistent disk
app.use('/photos', express.static('/photos', {
  maxAge: '7d', // Cache photos for 7 days
  setHeaders: (res, path) => {
    // Set proper headers for images
    if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Content-Type', 'image/' + path.split('.').pop()?.toLowerCase());
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    }
  }
}));

// Backward compatibility: serve legacy uploads if they exist
const legacyUploadsPath = path.join(__dirname, '../uploads');
if (fs.existsSync(legacyUploadsPath)) {
  app.use('/uploads', express.static(legacyUploadsPath, {
    maxAge: '7d'
  }));
}

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    headers: req.headers,
  });
  next();
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  logger.info("Health check endpoint called");
  res.status(200).json({ status: "OK" });
});

// Additional health probe endpoints
app.get("/healthz", (req: Request, res: Response) => {
  logger.info("/healthz called");
  res.status(200).json({ status: "ok" });
});
app.head("/healthz", (req: Request, res: Response) => {
  res.status(200).end();
});

app.get("/livez", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});
app.head("/livez", (req: Request, res: Response) => {
  res.status(200).end();
});

app.get("/readyz", (req: Request, res: Response) => {
  try {
    const storageExists = fs.existsSync(baseStoragePath);
    const ready = storageExists;
    const details = {
      status: ready ? "ok" : "degraded",
      storageExists,
      storagePath: baseStoragePath,
      timestamp: new Date().toISOString(),
    };
    res.status(ready ? 200 : 503).json(details);
  } catch (e) {
    res.status(503).json({ status: "error", error: (e as Error).message });
  }
});
app.head("/readyz", (req: Request, res: Response) => {
  const storageExists = fs.existsSync(baseStoragePath);
  res.status(storageExists ? 200 : 503).end();
});

// Routes
app.use("/api/account", accountRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/metadata", metaDataRoutes);
app.use("/api/stripe", stripeRoutes);

// Swagger documentation setup
app.use("/api-docs", swaggerUi.serve);
app.get(
  "/api-docs",
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Account Management API Documentation",
    swaggerOptions: {
      url: "/api-docs/swagger.json",
    },
  })
);

// Serve swagger spec
app.get("/api-docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Internal server error", {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
