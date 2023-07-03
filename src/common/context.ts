import { Application } from "express";
import { Server } from "socket.io";

export interface IContext {
  socket?: Server;

  express?: Application;
}
