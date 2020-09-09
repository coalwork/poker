window.addEventListener('DOMContentLoaded', () => {
  const inputEvent = (data) => new CustomEvent('input', { data });

  const terminal = new Terminal(
    document.getElementById('terminal-line'),
    document.getElementById('terminal'),
    (command) => {
      console.log(command);
      const commandText = document.createTextNode(command);

      if (command[0] !== '/') return terminal.write(commandText);
      terminal.write(': ' + commandText);
    }
  );

  terminal.input.addEventListener('keydown', (event) => {
    console.log(event.target.value);
    if (event.key === 'Enter') terminal.input.dispatchEvent(inputEvent(event.target.value));
  });
});
