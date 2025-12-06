import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Cron Job: Auto-delete pending orders after 24 hours
async function cleanupExpiredOrders() {
  try {
    const { storage } = await import("./storage");
    const { db } = await import("./db");
    const { orders } = await import("../shared/schema");
    const { sql } = await import("drizzle-orm");
    const { eq, and, lt } = await import("drizzle-orm");

    // Get current time minus 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Query: Find all pending orders older than 24 hours
    const expiredOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, "pending"),
          lt(orders.createdAt, twentyFourHoursAgo)
        )
      );

    if (expiredOrders.length > 0) {
      console.log(
        `[Cleanup Cron] Found ${expiredOrders.length} expired pending orders. Deleting...`
      );

      // Delete each expired order
      for (const order of expiredOrders) {
        try {
          await storage.deleteOrder(order.id);
          console.log(
            `[Cleanup Cron] ✓ Deleted expired order ID: ${order.id}`
          );
        } catch (err) {
          console.error(
            `[Cleanup Cron] ✗ Failed to delete order ${order.id}:`,
            (err as any).message
          );
        }
      }

      console.log(
        `[Cleanup Cron] ✓ Cleanup complete - ${expiredOrders.length} orders deleted`
      );
    } else {
      console.log(
        `[Cleanup Cron] No expired pending orders found (checked at ${new Date().toISOString()})`
      );
    }
  } catch (error) {
    console.error("[Cleanup Cron] ✗ Error during cleanup:", (error as any).message);
  }
}

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);

      // Start cleanup cron job - runs every hour
      console.log(
        "[Cron] Starting auto-cleanup for expired pending orders (every 60 minutes)"
      );
      setInterval(cleanupExpiredOrders, 60 * 60 * 1000); // 1 hour

      // Run cleanup once at startup to catch any pending orders
      cleanupExpiredOrders().catch((err) =>
        console.error("[Cron] Initial cleanup error:", err)
      );
    },
  );
})();
