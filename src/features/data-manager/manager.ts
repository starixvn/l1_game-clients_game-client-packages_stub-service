import { RawData, loadData } from "./loader";
import { Queue } from "./queue";
import { TestCase, rawToTestCases } from "./test-case";

export class Manager {
  private static raw: RawData[] = [];

  private static rawQueue = new Queue<RawData>();

  private static testCaseQueue = new Queue<TestCase>();

  public static async initialize(directory: string) {
    Manager.raw = await loadData(directory);

    this.raw.forEach((data) => this.rawQueue.enqueue(data));
  }

  public static getTestCase(): TestCase {
    if (this.testCaseQueue.empty()) {
      const raw = this.rawQueue.dequeue();

      if (raw) {
        console.debug(`DEBUG: Testing ${raw.name}`);
        const testSuite = rawToTestCases(raw);

        testSuite.forEach((test) => this.testCaseQueue.enqueue(test));
      }
    }

    return this.testCaseQueue.dequeue();
  }
}
