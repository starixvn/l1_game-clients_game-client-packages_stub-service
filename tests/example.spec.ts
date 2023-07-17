import { expect, test } from "@playwright/test";
import {
  Manager,
  TestCase,
  debug,
  startJob,
} from "../src/features/data-manager";

function assert<T>({ name, client }: TestCase, actual: T, expected: T) {
  debug(
    `${name}`,
    `the value of ${client.actual} should be ${client.expected}`
  );

  expect(actual).toStrictEqual(expected);
}

test.beforeEach(async ({ page }) => {
  function evaluate(code: string) {
    return page.evaluate((code) => eval(code), code);
  }

  await page.goto(
    process.env.CLIENT_URL || "http://localhost:9999/?token=x&lang=vi-VN"
  );
  await Manager.initialize("data");

  startJob({
    server: false,
    context: { assert, evaluate },
  });
});

test("start job", async ({ page }) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (Manager.done()) {
        clearInterval(interval);

        page.close();
        resolve();
      }
    }, 1000);
  });
});
