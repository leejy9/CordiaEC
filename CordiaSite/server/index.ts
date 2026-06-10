import { createServer } from "http";
import { createConfiguredApp } from "./app.ts";
import { setupVite, serveStatic, log } from "./vite.ts";

const port = parseInt(process.env.PORT || "5000", 10);

async function main() {
  const app = createConfiguredApp();
  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(
    {
      port,
      host: "localhost",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
