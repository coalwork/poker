const cmdLine = document.getElementById('terminal-line');
const terminal = document.getElementById('terminal');

const socket = io(window.location.origin);
const cmdsCache = [];

cmdLine.select();

cmdLine.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;

  const text = cmdLine.value;
  cmdLine.value = null;

  if (!!text.replace(/\s/g, '').length) {
    print(text);
    cmdsCache.push(text);
  }

  if (text[0] === '/') parseCommand(text);
});

function parseCommand(cmd) {
  const [ action, ...parameters ] = cmd.replace('/', '').split(/ /g);

  switch (action) {
    case 'log':
      const time = Date.now();
      socket.emit('log', parameters[0]);
      socket.once('log', (timeOut) => {
        print(`A log has been sent to the server. Time: ${timeOut - time}ms`);
      });
      break;
  }
}

function print(text) {
  const line = document.createElement('p');
  const lineText = document.createTextNode(text);
  line.append(lineText);

  terminal.insertBefore(line, cmdLine);
}
