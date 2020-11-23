const express = require('express')
const jwt = require('jsonwebtoken')
const { celebrate } = require('celebrate')
const mongoose = require('mongoose')

const { signup, signin } = require('./joiSchemas/schemas')
const Usuario = require('./models/usuario-model')
const verificarJWT = require('./auth/verificarJWT')
const RouteError = require('./helpers/RouteError')

const router = new express.Router()

mongoose.connect('mongodb://localhost/SKY', { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(error => {
    console.log(error.message)
  })

const db = mongoose.connection
db.once('open', () => {
  console.log('conexao aberta!')
})

router.post('/signup', celebrate(signup), async (req, res, next) => {
  try {
    const buscarUsuario = await Usuario.find({ email: req.body.email }).exec()
    if (buscarUsuario.length > 0) {
      throw new RouteError('E-mail já existente', 409)
    }
    const dataInicial = new Date()
    const novoUsuario = new Usuario()
    novoUsuario.nome = req.body.nome
    novoUsuario.email = req.body.email
    novoUsuario.senha = req.body.senha
    novoUsuario.telefones = req.body.telefones
    novoUsuario.data_criacao = dataInicial
    novoUsuario.data_atualizacao = dataInicial
    novoUsuario.ultimo_login = dataInicial
    novoUsuario.token = jwt.sign({ _id: novoUsuario._id }, process.env.secret, { expiresIn: 1800000 })
    await novoUsuario.save()
    res.json(novoUsuario.toJSON())
  } catch (error) {
    next(error)
  }
})

router.post('/signin', celebrate(signin), async (req, res, next) => {
  try {
    const [usuario] = await Usuario.find({ email: req.body.email }).exec()
    if (!usuario) {
      throw new RouteError('Usuário e/ou senha inválidos', 400)
    }
    const senhasBatem = await usuario.compararSenha(req.body.senha)
    if (!senhasBatem) {
      throw new RouteError('Usuário e/ou senha inválidos', 401)
    }
    usuario.ultimo_login = new Date()
    usuario.token = jwt.sign({ _id: usuario._id }, process.env.secret, { expiresIn: 1800000 })
    await usuario.save()
    res.json(usuario.toJSON())
  } catch (error) {
    next(error)
  }
})

router.get('/usuario/:user_id', verificarJWT, async (req, res, next) => {
  try {
    const authHeaderParts = req.headers.authorization.split(' ')
    const token = authHeaderParts[1]
    const usuario = await Usuario.findById(req.params.user_id).exec()
    if (!usuario) {
      throw new RouteError('Não autorizado', 401)
    } else if (usuario.token !== token) {
      throw new RouteError('Não autorizado', 401)
    }
    jwt.verify(token, process.env.secret, (error, decodedToken) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          next(new RouteError('Sessão inválida', 401))
        } else {
          next(new RouteError('Problemas no formato da requisição', 400))
        }
      } else {
        res.json(usuario.toJSON())
      }
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
