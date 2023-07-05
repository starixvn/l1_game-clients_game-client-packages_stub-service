import { debug } from "../../common";
import { Connection } from "../connections";
import { Event, Manager, TestCase } from "../data-manager";

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

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
}

export async function delay(test: TestCase) {
  if (test.server?.delay) {
    debug(test.name, `delay after ${test.server?.delay}ms`);

    await sleep(test.server?.delay);
  }
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

    debug(job.data.name, "running");

    job.status = JobStatus.RUNNING;

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
