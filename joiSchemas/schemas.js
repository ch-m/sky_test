const { Joi } = require('celebrate')

const schemas = {
  signup: {
    body: {
      nome: Joi.string().required(),
      email: Joi.string().email().required(),
      senha: Joi.string(),
      telefones: Joi.array().items({
        numero: Joi.number().required(),
        ddd: Joi.number().required()
      }).min(1)
    }
  },
  signin: {
    body: {
      email: Joi.string().email().required(),
      senha: Joi.string().required()
    }
  }
}

module.exports = schemas
