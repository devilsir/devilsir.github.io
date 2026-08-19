export class Inventory {
    items = new Map();
    onChange;
    constructor(onChange) {
        this.onChange = onChange;
    }
    add(item) {
        if (this.items.has(item.id))
            return false;
        this.items.set(item.id, item);
        this.emit();
        return true;
    }
    remove(id) {
        const removed = this.items.delete(id);
        if (removed)
            this.emit();
        return removed;
    }
    has(id) {
        return this.items.has(id);
    }
    list() {
        return [...this.items.values()];
    }
    ids() {
        return [...this.items.keys()];
    }
    restore(ids, catalog) {
        this.items.clear();
        for (const id of ids) {
            const item = catalog[id];
            if (item)
                this.items.set(id, item);
        }
        this.emit();
    }
    emit() {
        this.onChange(this.list());
    }
}
