export class Info {
  constructor(message) {
    this.message = message;
  }

  toString() {
    return `Info: ${this.message}`;
  }
}