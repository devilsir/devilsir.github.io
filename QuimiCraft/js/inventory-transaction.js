"use strict";

globalThis.QuimiCraftInventory = (() => {
  const full = "Libere espaço na mochila para receber todos os produtos.";
  const emptyVessels = {water_bucket: "bucket", water_cup: "cup", hazardous_container: "hazardous_container"};

  function plan(slots, consumed, produced, profiles = {}, reserved = []) {
    let next = slots.map(item => item ? {...item} : null);
    const returned = [];
    const matches = (item, id) => item && (item.id === id || (emptyVessels[item.id] && profiles[id]?.includes(item.liquid?.id)));

    function take(id, quantity, returnContainers) {
      let remaining = quantity;
      for (const plain of [true, false]) {
        for (let i = 0; i < next.length && remaining > 0; i++) {
          const item = next[i];
          if (!matches(item, id) || (item.id === id) !== plain) continue;
          const taken = Math.min(remaining, item.count);
          item.count -= taken;
          remaining -= taken;
          if (item.count === 0) next[i] = null;
          if (!plain && returnContainers) {
            const container = emptyVessels[item.id];
            if (next[i] === null) next[i] = {id: container, count: taken};
            else returned.push([container, taken]);
          }
        }
      }
      return remaining === 0;
    }

    for (const [id, quantity] of consumed) {
      if (!take(id, quantity, true)) return {ok: false, reason: "missing", id};
    }
    if (reserved.length) {
      const actual = next;
      next = next.map(item => item ? {...item} : null);
      const available = reserved.every(([id, quantity]) => take(id, quantity, false));
      next = actual;
      if (!available) return {ok: false, reason: "reserved"};
    }

    for (const [id, quantity] of [...returned, ...produced]) {
      let index = next.findIndex(item => item?.id === id && !item.liquid);
      if (index < 0) index = next.indexOf(null);
      if (index < 0) return {ok: false, reason: "full"};
      if (next[index]) next[index].count += quantity;
      else next[index] = {id, count: quantity};
    }
    return {ok: true, slots: next};
  }

  return {plan, full};
})();
