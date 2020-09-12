window.addEventListener('DOMContentLoaded', () => {
  const terminal = new Terminal(
    document.getElementById('terminal-line'),
    document.getElementById('terminal'),
    function (output) {
      const line = document.createElement('p');
      line.append(output.body);
      ('type' in output) && line.classList.add(output.type);

      this.output.insertBefore(line, document.getElementById('input-line'));
      this.output.scrollTop = this.output.scrollHeight;
    },
    function (input) {
      this.input.value = null;

      if (input[0] === '/') {

      }

      this.out(textInput);
    }
  );

  terminal.input.select();

  terminal.input.addEventListener('keydown', (event) => {
    if (!event.target.value.replace(/\s/g, '').length) { return; }
    if (event.key === 'Enter') { terminal.in(event.target.value); }
  });
});

function parseCommand(cmd) {
  
};
