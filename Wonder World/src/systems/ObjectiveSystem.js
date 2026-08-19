export class ObjectiveSystem {
    current = { id: "none", text: "" };
    onChange;
    constructor(onChange) {
        this.onChange = onChange;
    }
    set(id, text) {
        this.current = { id, text };
        this.onChange(this.current);
    }
    get() {
        return this.current;
    }
}
