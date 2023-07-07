import { Socket } from "socket.io";
import { IContext } from "../../common";
import { Event } from "../data-manager";
import { Queue } from "../data-manager/queue";

export type Publisher = {
  publish<T>(event: string, payload: T): void;
};

export type UserConnection = {
  namespace: string;
  publisher: Publisher;
  socket?: Socket;
};

export class Connection {
  protected static userConnections: Record<string, UserConnection> = {};

  protected static receivedEvents = new Queue<Event>();

  static initialize({ socket, express }: IContext, namespaces: string[]) {
    namespaces.forEach((namespace) => {
      socket.of(namespace).on("connection", (userSocket) => {
        console.log(userSocket.handshake.headers["user-agent"]);

        const id = userSocket.id;

        this.userConnections[id] = {
          socket: userSocket,
          namespace,
          publisher: {
            publish: (event, payload) => userSocket.emit(event, payload),
          },
        };

        userSocket.on("disconnect", () => {
          delete this.userConnections[id];
        });

        userSocket.onAny((event, payload) => {
          this.receivedEvents.enqueue({ event, payload, namespace });
        });
      });
    });

    express.all("*", (request, response) => {
      console.log(request.headers["user-agent"]);

      const namespace = request.originalUrl;
      const event = request.method.toLowerCase();
      const payload = request.body;
      const id = Date.now();

      this.receivedEvents.enqueue({ event, payload, namespace });
      this.userConnections[id] = {
        namespace,
        publisher: {
          publish: (_, payload) => {
            delete this.userConnections[id];

            response.send(payload);
          },
        },
      };
    });
  }

  static getConnections(namespace: string) {
    return Object.values(this.userConnections).filter(
      (user) => user.namespace === namespace
    );
  }

  static emit<T>(namespace: string, event: string, payload: T) {
    const connections = this.getConnections(namespace);

    connections.forEach((connection) =>
      connection.publisher.publish(event, payload)
    );
  }

  static async waitConnection(namespace: string) {
    return new Promise((resolve) => {
      setInterval(() => {
        if (this.getConnections(namespace).length !== 0) {
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
    return new Promise((resolve) => {
      let interval = setInterval(() => {
        const receivedEvent = this.receivedEvents.dequeue();

        if (
          receivedEvent?.namespace === namespace &&
          receivedEvent?.event === event &&
          predicate(receivedEvent.payload)
        ) {
          clearInterval(interval);

          resolve(true);
        } else {
          this.receivedEvents.enqueue(receivedEvent);
        }
      }, 1000);
    });
  }
}
