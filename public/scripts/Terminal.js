class HTMLTerminal {
  constructor(input, output) {
    this.input = input;
    this.output = output;
    this._suspended = false;
  }
  get suspended() {
    return this._suspended;
  }
  set suspended(value) {
    this._suspended = value;
    if (value) {
      this.input.placeholder = 'Terminal is suspended';
    } else {
      this.input.placeholder = this.input.getAttribute('data-placeholder');
    }
    return this.input.disabled = value;
  }
  writeText(text, ...styles) {
    if (this.suspended) { return; }

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
    return this.writeHTML(line);
  }
  writeHTML(data) {
    if (this.suspended) { return; }

    const { scrollTop, scrollHeight, offsetHeight } = this.output;
    let isScrolledDown;
    isScrolledDown = scrollTop + offsetHeight === scrollHeight
    this.output.append(data);
    if (isScrolledDown) {
      this.output.scrollTop = scrollHeight;
    }

    return data;
  }
  writeRaw(htmlString) {
    this.output.innerHTML += htmlString;
  }
  async parse(command, globalSocket) {
    if (this.suspended) { return; }

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
        this.writeText(command, 'input');
        this.writeText([
          '/clear                          | Clears the terminal.',
          '/help                           | Displays this help message.',
          '/users                          | Displays registered users.',
          '/login*                         | Prompts the user to log into the server.',
          '/log <message>                  | Logs a message to the server.',
          '/register <username> <password> | Registers a user to the server.',
          '* This command redirects to the server.'
        ], 'output');
        break;

      case 'log':
        const oldTime = Date.now();
        const { newTime } = await logToServer(globalSocket, parameters[0]);
        this.writeText(command, 'input');
        this.writeText(`A log has been sent to the server. Time: ${oldTime - newTime}ms`, 'output');

        break;

      case 'clear':
        Array.from(this.output.children).forEach((child) => child.remove());
        break;

      case 'register':
        this.writeText(`${action} ${parameters[0] || ''} ${new Array((parameters[1] || '').length).fill('-').join('')}`, 'input');
        this.writeText('Sending a register request to the server...', 'output');
        this.writeText(await register(globalSocket, parameters[0], parameters[1]), 'output');
        this.writeText('Register does not automatically log in, please use /login', 'output');
        break;

      case 'users':
        this.writeText(command, 'input');
        globalSocket.emit('users');
        globalSocket.once('users', (users) => {
          this.writeText(JSON.stringify(users, null).replace(/[[\]]/g, '').split(','), 'output');
        });
        break;

      case 'login':
        this.writeText(command, 'input');
        if ((await this.prompt('This command redirects you. Proceed? (y/N) ')).toLowerCase() !== 'y') { return; }

        const form = document.createElement('form');
        const username = document.createElement('input');
        const password = document.createElement('input');
        form.action = `${window.location.origin}/login`;
        form.method = 'POST';
        username.name = 'username';
        password.name = 'password';
        username.value = await this.prompt('What is your username? ');
        password.value = await this.prompt('What is your password? ');
        form.append(username, password);
        form.style.display = 'none';
        document.body.append(form);

        const text = document.createElement('p');
        text.innerHTML = 'Redirecting in <span>5</span> seconds...';
        text.classList.add('output');
        this.writeHTML(text);
        const time = Date.now() + 5000;
        const interval = setInterval(() => {
          text.children[0].innerText = Math.round((time - Date.now()) / 1000);
          if (Date.now() > time) {
            clearInterval(interval);
            form.submit();
          }
        }, 1000);
        break;

      default:
        this.writeText(command, 'input');
        this.writeText(`'${action.slice(1)}' is not a valid command.`, 'output');
    }
  }
  async prompt(message = '<empty\u00A0prompt>\u00A0') {
    if (this.suspended) { return; }

    validatePrompt(message);

    this.suspended = true;

    const prompter = document.getElementById('prompt').content.cloneNode(true);
    const input = prompter.querySelector('input');

    prompter.querySelector('p').prepend(message);
    this.output.append(prompter);

    input.onkeydown = (event) => input.size = event.target.value.length + 1;

    input.select();

    const userInput = await new Promise((resolve, reject) => {
      input.onkeydown = (event) => {
        if (event.key !== 'Enter') { return; }
        input.disabled = true;
        input.onkeydown = null;
        resolve(event.target.value);
      };
    });

    this.suspended = false;
    this.input.select();

    return userInput;
  }
}

function validatePrompt(message) {
  if (message.trim().length === 0) { throw Error('Message may not consist of only whitespace'); }
}

function logToServer(socket, message = '') {
  const oldTime = Date.now();
  socket.emit('log', message);

  return new Promise((resolve, reject) => {
    socket.once('log', (newTime) => {
      resolve({ oldTime, newTime });
    });
  });
}

function register(socket, username, password) {
  socket.emit('register', { username, password });

  return new Promise((resolve) => {
    socket.once('register', resolve);
  });
}
