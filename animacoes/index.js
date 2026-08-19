    (() => {
      const search = document.querySelector('#search');
      const cards = [...document.querySelectorAll('.project')];
      const count = document.querySelector('#count');
      const empty = document.querySelector('#empty');
      const year = document.querySelector('#year');

      year.textContent = new Date().getFullYear();

      const normalize = (value) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      const update = () => {
        const query = normalize(search.value);
        let visible = 0;

        cards.forEach((card) => {
          const content = normalize(`${card.textContent} ${card.dataset.search || ''}`);
          const match = !query || content.includes(query);
          card.hidden = !match;
          if (match) visible += 1;
        });

        count.textContent = visible;
        empty.classList.toggle('show', visible === 0);
      };

      search.addEventListener('input', update);
      document.addEventListener('keydown', (event) => {
        if (event.key === '/' && document.activeElement !== search) {
          event.preventDefault();
          search.focus();
        }
      });
    })();
  
