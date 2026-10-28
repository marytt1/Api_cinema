require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const { NotFoundError } = require('./errors');

// Configuração do Express
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotas públicas
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', require('./routes/auth'));
app.use('/filmes', require('./routes/filmes'));
app.use('/salas', require('./routes/salas'));
app.use('/sessoes', require('./routes/sessoes'));
app.use('/clientes', require('./routes/clientes'));
app.use('/compras', require('./routes/compras'));

app.use((req, res, next) => next(new NotFoundError('Rota não encontrada')));
app.use(errorHandler);

module.exports = app;
