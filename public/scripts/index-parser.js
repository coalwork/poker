async function parseCommand(cmd, terminal) {
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
      socket.emit('log', parameters[0]);
      socket.once('log', (newTime) => {
        terminal.out({
          body: document.createTextNode(`A log has been sent to the server. Time: ${newTime - time}ms`),
          type: 'output'
        });
        return;
      });
      break;
    case 'clear':
      document
        .querySelectorAll('#terminal > .input, #terminal > .output')
        .forEach((element) => element.remove());
      break;
    case 'help':
      terminal.out({
        body:
          `/help: Displays this message
          /log: Sends a log to the server
          /clear: Clears all the lines in the terminal`,
        type: 'output'
      });
      break;
  }
}
