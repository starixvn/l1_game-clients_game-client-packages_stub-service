import { readFile, readdir } from "fs/promises";
import { join } from "path";

export type RawData = {
  name: string;
  data: Object;
};

export async function loadJsonFile(
  directory: string,
  name: string
): Promise<RawData> {
  const path = join(directory, name);
  const raw = await readFile(path, "utf8");

  return { name, data: JSON.parse(raw) };
}

export async function loadJsonFiles(directory: string): Promise<RawData[]> {
  const files = await readdir(directory);
  const jsonFiles = files.filter((file) => file.includes(".json"));

  return Promise.all(jsonFiles.map((file) => loadJsonFile(directory, file)));
}

export function loadData(directory: string) {
  return loadJsonFiles(directory);
}
