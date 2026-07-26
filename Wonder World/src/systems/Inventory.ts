export interface InventoryItem {
  id: string;
  name: string;
  description: string;
}

export class Inventory {
  private readonly items = new Map<string, InventoryItem>();
  private readonly onChange: (items: InventoryItem[]) => void;

  public constructor(onChange: (items: InventoryItem[]) => void) {
    this.onChange = onChange;
  }

  public add(item: InventoryItem): boolean {
    if (this.items.has(item.id)) return false;
    this.items.set(item.id, item);
    this.emit();
    return true;
  }

  public remove(id: string): boolean {
    const removed = this.items.delete(id);
    if (removed) this.emit();
    return removed;
  }

  public has(id: string): boolean {
    return this.items.has(id);
  }

  public list(): InventoryItem[] {
    return [...this.items.values()];
  }

  public ids(): string[] {
    return [...this.items.keys()];
  }

  public restore(ids: string[], catalog: Record<string, InventoryItem>): void {
    this.items.clear();
    for (const id of ids) {
      const item = catalog[id];
      if (item) this.items.set(id, item);
    }
    this.emit();
  }

  private emit(): void {
    this.onChange(this.list());
  }
}
