import { createServer } from "http";
import { IContext } from "./common";
import { Connection, Manager, startJob } from "./features";
import {
  CreateExpressServerOptions,
  CreateSocketServerOptions,
  createExpressServer,
  createSocketServer,
} from "./servers";

export interface StartupOptions {
  dataDirectory: string;
  namespaces: string[];
  port: string;
  express: CreateExpressServerOptions;
  socket: Partial<CreateSocketServerOptions>;
}

export async function startup(options: StartupOptions) {
  const express = createExpressServer(options.express);
  const httpServer = createServer(express);
  const socket = createSocketServer(httpServer, options.socket);
  const context: IContext = { express, socket };

  await Manager.initialize(options.dataDirectory);
  Connection.initialize(context, options.namespaces);

  startJob();

  httpServer.listen(options.port);
}
