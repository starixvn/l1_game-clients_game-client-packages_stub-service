import express, { Express } from "express";

export interface CreateExpressServerOptions {
  useMiddleware?: (server: Express) => void;
}

export function createExpressServer(options: CreateExpressServerOptions = {}) {
  const server = express();

  options.useMiddleware && options.useMiddleware(server);

  return server;
}
