export class Queue<T> {
  protected items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T {
    return this.items.shift();
  }

  size() {
    return this.items.length;
  }

  empty() {
    return this.size() === 0;
  }
}
