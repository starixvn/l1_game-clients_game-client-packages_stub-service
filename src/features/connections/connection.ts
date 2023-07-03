import { Socket } from "socket.io";
import { IContext } from "../../common";

export type UserConnection = {
  namespace: string;
  socket: Socket;
};

export class Connection {
  protected static userSockets: Record<string, UserConnection> = {};

  static initialize({ socket }: IContext, namespaces: string[]) {
    namespaces.forEach((namespace) => {
      socket.of(namespace).on("connection", (userSocket) => {
        const id = userSocket.id;

        console.log(`A user connected ${id}`);

        this.userSockets[id] = { socket: userSocket, namespace };

        userSocket.on("disconnect", () => {
          delete this.userSockets[id];
        });
      });
    });
  }

  static getSockets(namespace: string) {
    return Object.values(this.userSockets)
      .filter((user) => user.namespace === namespace)
      .map((user) => user.socket);
  }

  static emit<T>(namespace: string, event: string, payload: T) {
    const sockets = this.getSockets(namespace);

    sockets.forEach((socket) => socket.emit(event, payload));
  }

  static async waitConnection(namespace: string) {
    return new Promise((resolve) => {
      setInterval(() => {
        if (this.getSockets(namespace).length !== 0) {
          resolve(true);
        }
      });
    });
  }

  static async waitUntil<T>(
    namespace: string,
    event: string,
    predicate: (data: T) => boolean
  ) {
    await this.waitConnection(namespace);

    const sockets = this.getSockets(namespace);

    return new Promise((resolve) => {
      sockets.forEach((socket) =>
        socket.on(event, (payload) => {
          if (predicate(payload)) {
            sockets.forEach((socket) => socket.removeAllListeners(event));

            resolve(true);
          }
        })
      );
    });
  }
}
