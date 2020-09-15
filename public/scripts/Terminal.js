class HTMLTerminal {
  constructor(input, output) {
    this.input = input;
    this.output = output;
  }
  writeText(text, ...styles) {
    let line;
    if (text instanceof Array) {
      line = new DocumentFragment();
      text.forEach((chunk) => {
        const p = document.createElement('p');
        p.append(chunk);
        p.classList.add(...styles);
        line.append(p);
      });
    } else {
      line = document.createElement('p');
      line.append(document.createTextNode(text));
      line.classList.add(...styles);
    }
    this.writeHTML(line);
  }
  writeHTML(data) {
    const { scrollTop, scrollHeight, offsetHeight } = this.output;
    let isScrolledDown;
    isScrolledDown = scrollTop + offsetHeight === scrollHeight
    this.output.append(data);
    if (isScrolledDown) {
      this.output.scrollTop = scrollHeight;
    }
  }
  parse(command, globalSocket) {
    let join = false;
    let joinStr = '';
    const [ action, ...parameters ] = command.split(' ').reduce((strArr, chunk) => {
    	if (!chunk.includes('"') && !join) { return [...strArr, chunk]; }

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
      case 'help':
        this.writeText([
          '/clear                          | Clears the terminal.',
          '/help                           | Display this help message.',
          '/log <message>                  | Logs a message to the server.',
          '/register <username> <password> | Registers a user to the server.'
        ], 'output');
        break;
      case 'log':
        const oldTime = Date.now();
        globalSocket.emit('log', parameters[0]);
        globalSocket.once('log', (newTime) => {
          this.writeText(command, 'input');
          this.writeText(`A log has been sent to the server. Time: ${oldTime - newTime}ms`, 'output');
        });
        break;
      case 'clear':
        Array.from(this.output.children).forEach((child) => child.remove());
        break;
      case 'register':
        this.writeText(`${action} ${parameters[0] || ''} ${new Array((parameters[1] || '').length).fill('-').join('')}`, 'input');
        this.writeText('Sending a register request to the server...', 'output');
        socket.emit('register', {
          username: parameters[0],
          password: parameters[1]
        });
        socket.once('register', (message) => {
          this.writeText(message, 'output');
        });
        break;
      default:
        this.writeText(command, 'input');
        this.writeText(`'${action.slice(1)}' is not a valid command.`, 'output');
    }
  }
}
