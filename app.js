// dans le fichier app.js

// importation des outils
const express = require('express');
const mongoose = require('mongoose');
const app = express();
// on importe la méthode path de Node qui donne accès au chemin de notre système de fichier
const path = require('path'); 

mongoose.connect('mongodb+srv://admin:LymnxGtLm5hbaaoV@piiquante.2nbrr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
})


module.exports = app;