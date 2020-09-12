setInterval(() => {
  document.body.style['background-image'] = `
    url('/assets/pattern.png'),
    linear-gradient(
      to bottom right,
      hsl(${Date.now() / 40 % 360}, 51%, 47%),
      hsl(${(Date.now() / 40 - 276) % 360}, 98%, 55%)
    )`;
}, 35);
