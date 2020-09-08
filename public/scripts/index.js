const cmdLine = document.getElementById('terminal-line');
const terminal = document.getElementById('terminal');

const socket = io(window.location.origin);
const cmdsCache = [];
const tempNum = 0;
let cmdsIndex = {
  _num: 0,
  get num() {
    return this._num;
  },
  set num(value) {
    return this._num = constrain(value, 0, cmdsCache.length);
  },
  valueOf() {
    return this._num;
  }
};

cmdLine.select();

cmdLine.addEventListener('keydown', ({ key }) => {
  if (key !== 'Enter') return;

  const text = cmdLine.value;
  cmdLine.value = null;

  if (!!text.replace(/\s/g, '').length) {
    print(text);
    cmdsCache.unshift(text);
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

function constrain(num, limit1, limit2) {
  return num < limit1 ? limit1 : num > limit2 ? limit2 : num;
}
