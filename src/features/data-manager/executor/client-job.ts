import { debug } from "../debug";
import { Manager } from "../manager";
import { TestCase } from "../test-case";
import { JobStatus, sleep } from "./utils";

export interface IClientContext {
  assert: <T>(test: TestCase, actual: T, expected: T) => void;
  evaluate: <T>(code: string) => Promise<T>;
}

export function startClientJob({ assert, evaluate }: IClientContext) {
  const job = {
    status: JobStatus.STARTING,
    data: Manager.getTestCase(),
  };

  setInterval(async () => {
    if (!job.data || !job.data.client) {
      job.data = Manager.getTestCase();
      job.status = JobStatus.STARTING;

      return;
    }

    if (job.status === JobStatus.RUNNING) {
      return;
    }

    job.status = JobStatus.RUNNING;
    debug(job.data.name, "running");

    const { client } = job.data;

    if (client.delayForAction && client.action) {
      debug(job.data.name, `wait for action in ${client.delayForAction} ms`);

      await sleep(client.delayForAction);

      debug(job.data.name, `trigger action ${client.action}`);
      await evaluate(client.action);
    }

    if (client.delayForAssert) {
      debug(job.data.name, `wait for assert in ${client.delayForAssert} ms`);

      await sleep(client.delayForAssert);
    }

    if (client.actual) {
      const actual = await evaluate(client.actual);

      assert(job.data, actual, client.expected);
    }

    debug(job.data.name, "ended");

    job.data = Manager.getTestCase();
    job.status = JobStatus.STARTING;
  });
}
