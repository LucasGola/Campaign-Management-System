export abstract class Entity<T> {
  protected readonly props: T;
  readonly id: string;

  constructor(id: string, props: T) {
    this.id = id;
    this.props = props;
  }

  getProps(): T {
    return this.props;
  }
}
