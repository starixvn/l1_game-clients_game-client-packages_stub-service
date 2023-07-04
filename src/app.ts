import cors from "cors";
import express from "express";
import { getValue } from "./common";
import { startup } from "./startup";

const dataDirectory = getValue("DATA_DIR", "data");
const corsOrigin = getValue("CORS_ORIGIN", "*");
const port = getValue("PORT", "8080");
const namespaces = getValue("NAMESPACES", "/,/user/sedie").split(",");

const corsConfigs = { origin: corsOrigin };

startup({
  dataDirectory,
  namespaces,
  express: {
    useMiddleware(server) {
      server.use(cors(corsConfigs));
      server.use(express.json());
    },
  },
  socket: { cors: corsConfigs },
  port,
});
