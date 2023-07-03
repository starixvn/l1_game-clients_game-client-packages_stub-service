import { getValue } from "./common";
import { startup } from "./startup";

const dataDirectory = getValue("DATA_DIR", "data");
const corsOrigin = getValue("CORS_ORIGIN", "*");
const port = getValue("PORT", "8080");
const namespaces = getValue("NAMESPACES", "/").split(",");

startup({
  dataDirectory,
  namespaces,
  express: {},
  socket: { cors: { origin: corsOrigin } },
  port,
});
