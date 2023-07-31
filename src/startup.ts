import { Connection, Manager, startJob } from "@sg/cocos-integration-testing";
import { createServer } from "http";
import { IContext } from "./common";
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

  startJob({ server: true });

  httpServer.listen(options.port);
}
