(() => {
  const wrongCredit = "Direção criativa e conceito: Timbó";
  const correctCredit = "Direção criativa e conceito: Lucas Xavier Nardelli";

  const fixCredits = (root) => {
    const elements = [];

    if (root instanceof Element && root.matches("p")) {
      elements.push(root);
    }

    if (root instanceof Document || root instanceof Element) {
      elements.push(...root.querySelectorAll("p"));
    }

    elements.forEach((element) => {
      if (element.textContent?.trim() === wrongCredit) {
        element.textContent = correctCredit;
      }
    });
  };

  fixCredits(document);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          fixCredits(node);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
