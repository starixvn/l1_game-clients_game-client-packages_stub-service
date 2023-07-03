import { Server as SocketIOServer, ServerOptions, Socket } from "socket.io";

export interface CreateSocketServerOptions extends ServerOptions {
  useMiddleware?: (socket: Socket, next: unknown) => void;
}

export function createSocketServer(
  existedServer: any = null,
  options: Partial<CreateSocketServerOptions> = {}
) {
  const server = new SocketIOServer(existedServer, options);

  options.useMiddleware && server.use(options.useMiddleware);

  return server;
}
