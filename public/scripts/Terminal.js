class Terminal {
  constructor(input, output, commandParser) {
    this.input = input;
    this.output = output;
    this.parseCommand = commandParser;

    this.input.addEventListener('input', (command) => {
      this.parseCommand(command);
    });
  }
  write(textElem) {
    this.output.append(textElem);
  }
}
