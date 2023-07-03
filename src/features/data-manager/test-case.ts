import { RawData } from "./loader";

export type Event = {
  namespace: string;
  event: string;
  payload: unknown;
};

export type TestCase = {
  name?: string;
  server: {
    response: Event[];
    waitForRequest: Event;
  };
  client: unknown;
};

export function rawToTestCases(raw: RawData): TestCase[] {
  if (Array.isArray(raw.data)) {
    return raw.data;
  }

  return [raw.data as TestCase];
}
