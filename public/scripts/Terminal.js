class Terminal {
  constructor(input, output, writer = () => {}, commandParser = () => {}) {
    this.input = input;
    this.output = output;
    this.out = writer.bind(this);
    this.in = commandParser.bind(this);
  }
}
