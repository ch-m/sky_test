const RouteError = require('../helpers/RouteError')

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw new RouteError('Não autorizado', 401)
    }
    const authHeaderParts = authHeader.split(' ')
    if (!authHeaderParts[1]) {
      throw new RouteError('Não autorizado', 401)
    }
    next()
  } catch (error) {
    next(error)
  }
}
