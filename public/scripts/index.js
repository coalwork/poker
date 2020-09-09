const terminalLine = document.getElementById('terminal-line');
const inputLine = document.getElementById('input-line');
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

terminalLine.select();

terminalLine.addEventListener('keydown', ({ key }) => {
  if (key !== 'Enter') return;

  const text = terminalLine.value;
  terminalLine.value = null;

  if (!!text.replace(/\s/g, '').length) {
    print(text, false);
    cmdsCache.unshift(text);
  }

  if (text[0] === '/') parseCommand(text);
});

function parseCommand(cmd) {
  // const [ action, ...tempParameters ] = cmd.replace('/', '').split(/ /g);

  let join = false;
  let joinStr = '';
  const [ action, ...parameters ] = cmd.split(' ').reduce((strArr, chunk) => {
  	if (!chunk.includes('"') && !join) { return [...strArr, chunk] }
  	if (/^"/.test(chunk)) { join = true; }
  	if (join) { joinStr += chunk + ' '; }
  	if (/"$/.test(chunk)) {
  		join = false;
  		const temp = joinStr;
  		joinStr = '';
  		return [...strArr, temp.slice(0, -1)];
  	}
  	return strArr;
  }, []);

  switch (action.slice(1)) {
    case 'log':
      const time = Date.now();
      socket.emit('log', parameters[0].replace(/"/g, ''));
      socket.once('log', (timeOut) => {
        print(`A log has been sent to the server. Time: ${timeOut - time}ms`);
      });
      break;
  }
}

function print(text, output = true) {
  const line = document.createElement('p');
  const outputSign = document.createElement('span');
  outputSign.append(document.createTextNode(output ? '> ' : '< '));
  line.append(outputSign, document.createTextNode(text));

  terminal.insertBefore(line, inputLine);
}

function constrain(num, limit1, limit2) {
  return num < limit1 ? limit1 : num > limit2 ? limit2 : num;
}
