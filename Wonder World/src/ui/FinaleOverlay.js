const activeFinales = new WeakMap();

// Keep the native modal open through its fade so late input cannot reach the game.
export function openFinaleOverlay(root, dialog, button, timing, onComplete) {
    activeFinales.get(root)?.dispose();
    const timers = new Set();
    let status = "open";
    const clearTimers = () => {
        for (const timer of timers) clearTimeout(timer);
        timers.clear();
    };
    const schedule = (action, delay) => {
        const timer = setTimeout(() => {
            timers.delete(timer);
            if (status !== "closed" && dialog.isConnected) action();
        }, delay);
        timers.add(timer);
    };
    const dispose = () => {
        if (status === "closed") return;
        status = "closed";
        clearTimers();
        button.removeEventListener("click", skip);
        dialog.removeEventListener("cancel", cancel);
        dialog.removeEventListener("close", dispose);
        if (activeFinales.get(root) === session) activeFinales.delete(root);
        if (dialog.open) dialog.close();
        dialog.remove();
    };
    const finish = () => {
        if (status !== "open" || !dialog.isConnected) return;
        status = "leaving";
        clearTimers();
        button.disabled = true;
        const complete = () => {
            dispose();
            onComplete();
        };
        if (timing.fadeMs > 0) {
            dialog.classList.add("leaving");
            schedule(complete, timing.fadeMs);
        } else complete();
    };
    const skip = () => { if (!button.disabled) finish(); };
    const cancel = (event) => {
        event.preventDefault();
        skip();
    };
    const session = { dispose };
    activeFinales.set(root, session);
    button.addEventListener("click", skip);
    dialog.addEventListener("cancel", cancel);
    dialog.addEventListener("close", dispose);
    root.append(dialog);
    dialog.showModal();
    schedule(() => {
        button.disabled = false;
        button.focus({ preventScroll: true });
    }, timing.unlockMs);
    schedule(finish, timing.autoMs);
    return schedule;
}
