export interface ObjectiveDefinition {
  id: string;
  text: string;
}

export class ObjectiveSystem {
  private current: ObjectiveDefinition = { id: "none", text: "" };
  private readonly onChange: (objective: ObjectiveDefinition) => void;

  public constructor(onChange: (objective: ObjectiveDefinition) => void) {
    this.onChange = onChange;
  }

  public set(id: string, text: string): void {
    this.current = { id, text };
    this.onChange(this.current);
  }

  public get(): ObjectiveDefinition {
    return this.current;
  }
}
