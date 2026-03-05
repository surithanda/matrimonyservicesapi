import "./polyfill";
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
import stripeRoutes from "./routes/stripe.routes";
import azurePhotosRoutes from "./routes/azurePhotos.routes";
import { handleWebhookEvent } from "./controllers/stripe.controller";
import { testAzureConnection } from "./utils/azure.util";

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

// Request logging middleware — skip noisy browser auto-requests and health probes
const SKIP_LOG_PATHS = new Set(['/favicon.ico', '/healthz', '/livez', '/readyz']);
app.use((req, res, next) => {
  if (!SKIP_LOG_PATHS.has(req.url)) {
    logger.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      ip: req.headers['x-forwarded-for'] || req.ip,
    });
  }
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
  // Storage is Azure Blob — no local disk dependency
  res.status(200).json({ status: "ok", storage: "azure", timestamp: new Date().toISOString() });
});
app.head("/readyz", (req: Request, res: Response) => {
  res.status(200).end();
});

// Routes
app.use("/api/account", accountRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profiles/photos", azurePhotosRoutes);
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

  // ─── Azure Blob Storage: verify connection is healthy on startup
  (async () => {
    try {
      await testAzureConnection();
    } catch (err) {
      logger.error("[Azure] Connection check failed — photo uploads may not work:", err);
    }
  })();
});
