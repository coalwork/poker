const socket = io(window.location.origin);

window.addEventListener('DOMContentLoaded', () => {
  const terminal = new HTMLTerminal(
    document.getElementById('terminal-line'),
    document.getElementById('terminal-window')
  );

  terminal.input.select();

  terminal.input.addEventListener('keydown', (event) => {
    if (!event.target.value.replace(/\s/g, '').length) { return; }
    if (event.key !== 'Enter') { return; }

    if (event.target.value[0] === '/') {
      terminal.parse(event.target.value, socket);
    } else {
      terminal.writeText(event.target.value, 'input');
    }

    terminal.input.value = null;
  });

  terminal.input.addEventListener('input', (event) => {
    if (/^\/register \b\w+?\b /.test(event.target.value)) {
      return event.target.setAttribute('type', 'password');
    }
    event.target.setAttribute('type', 'text');
  })
});
