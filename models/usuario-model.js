const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

const telefoneSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  ddd: { type: Number, required: true }
})

const usuarioSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4() },
  nome: { type: String, required: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  telefones: { type: [telefoneSchema], required: true },
  data_criacao: Date,
  data_atualizacao: Date,
  ultimo_login: Date,
  token: String
})

usuarioSchema.pre('save', function (next) {
  if (this.isModified('senha')) {
    bcrypt.genSalt(10)
      .then(salt => {
        bcrypt.hash(this.senha, salt)
          .then(hashedSenha => {
            this.senha = hashedSenha
            next()
          })
          .catch(error => {
            next(error)
          })
      }).catch(error => {
        next(error)
      })
  }
  next()
})

usuarioSchema.methods.compararSenha = async function (senha) {
  const senhasBatem = await bcrypt.compare(senha, this.senha)
  return senhasBatem
}
module.exports = mongoose.model('Usuario', usuarioSchema)
