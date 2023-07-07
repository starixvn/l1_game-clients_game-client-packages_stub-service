import { IClientContext, startClientJob } from "./client-job";
import { startServerJob } from "./server-job";

export * from "./server-job";

export function startJob<Ctx = unknown>(
  option: {
    server: boolean;
    context?: Ctx;
  } = { server: true }
) {
  if (option.server) {
    startServerJob();
  } else {
    startClientJob(option.context as IClientContext);
  }
}
