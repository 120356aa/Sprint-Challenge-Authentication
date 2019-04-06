const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { authenticate, generateToken } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

const db = require('../database/dbConfig.js');

function register(req, res) {
  const auth = req.body;
  const hash = bcrypt.hashSync(auth.password, 10);

  auth.password = hash;

  db('users')
    .insert(auth)
    .then(ids => res.status(201).json(ids))
    .catch(err => res.status(500).json({message: 'Error'}));
}

function login(req, res) {
  const auth = req.body;

  db('users')
    .where({username: auth.username})
    .first()
    .then(user => {

      if(user && bcrypt.compareSync(auth.password, user.password)) {
        const token = generateToken(user)
        res.status(200).json(token)
      } else
        res.status(401).json({message: 'Failed authorization '})

    })
    .catch(err => res.status(500).json({message: err}))
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
