const tabs = document.querySelectorAll('.tab');
  const frames = document.querySelectorAll('iframe');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    frames.forEach(f => f.classList.remove('active'));
    document.getElementById(btn.dataset.target).classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
  }));
