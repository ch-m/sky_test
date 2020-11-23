class RouteError extends Error {
  constructor (message, HTTPcode) {
    super(message)
    this.code = HTTPcode
  }
}

module.exports = RouteError
