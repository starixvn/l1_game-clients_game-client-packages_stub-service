import { Connection } from "../connections";
import { Event, Manager } from "../data-manager";

enum JobStatus {
  STARTING = 1,
  RUNNING,
  ENDED,
}

export async function sendResponse(events: Event[]) {
  await Promise.all(
    events.map(async ({ namespace, event, payload }) => {
      await Connection.waitConnection(namespace);

      Connection.emit(namespace, event, payload);
    })
  );
}

export function startJob() {
  const job = {
    status: JobStatus.STARTING,
    data: Manager.getTestCase(),
  };

  setInterval(async () => {
    if (!job.data || job.status === JobStatus.RUNNING) {
      return;
    }

    job.data.name && console.debug(`DEBUG: Running ${job.data.name}`);

    job.status = JobStatus.RUNNING;

    const { server } = job.data;

    if (!server.waitForRequest) {
      await sendResponse(server.response);

      job.status = JobStatus.ENDED;
    } else {
      const { waitForRequest } = server;
      const { namespace, event } = waitForRequest;
      const isMatchPayload = (payload: unknown) =>
        JSON.stringify(payload) === JSON.stringify(waitForRequest.payload);

      await Connection.waitUntil(namespace, event, isMatchPayload);
      await sendResponse(server.response);

      job.status = JobStatus.ENDED;
    }

    if (job.status === JobStatus.ENDED) {
      job.data.name && console.debug(`DEBUG: Ended ${job.data.name}`);

      job.data = Manager.getTestCase();
      job.status = JobStatus.STARTING;
    }
  });
}
