export abstract class ValueObject<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.value = Object.freeze(value);
  }

  equals(vo: ValueObject<T>): boolean {
    return JSON.stringify(this.value) === JSON.stringify(vo.value);
  }
}
