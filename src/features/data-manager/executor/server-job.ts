import { Event, Manager } from "..";
import { Connection } from "../../connections";
import { debug } from "../debug";
import { JobStatus, delay } from "./utils";

export async function sendResponse(events: Event[]) {
  await Promise.all(
    events.map(async ({ namespace, event, payload }) => {
      await Connection.waitConnection(namespace);

      Connection.emit(namespace, event, payload);
    })
  );
}

export function startServerJob() {
  const job = {
    status: JobStatus.STARTING,
    data: Manager.getTestCase(),
  };

  setInterval(async () => {
    if (!job.data || !job.data.server) {
      job.data = Manager.getTestCase();
      job.status = JobStatus.STARTING;

      return;
    }

    if (job.status === JobStatus.RUNNING) {
      return;
    }

    job.status = JobStatus.RUNNING;
    debug(job.data.name, "running");

    const { server } = job.data;

    if (!server.waitForRequest) {
      await delay(job.data);
      await sendResponse(server.response);

      job.status = JobStatus.ENDED;
    } else {
      const { waitForRequest } = server;
      const { namespace, event } = waitForRequest;
      const isMatchPayload = (payload: unknown) =>
        payload === waitForRequest.payload ||
        JSON.stringify(payload) === JSON.stringify(waitForRequest.payload);

      debug(
        job.data.name,
        "waiting for request\n",
        JSON.stringify(waitForRequest, null, 4)
      );

      await Connection.waitUntil(namespace, event, isMatchPayload);
      await delay(job.data);
      await sendResponse(server.response);

      job.status = JobStatus.ENDED;
    }

    if (job.status === JobStatus.ENDED) {
      debug(job.data.name, "ended");

      job.data = Manager.getTestCase();
      job.status = JobStatus.STARTING;
    }
  });
}
