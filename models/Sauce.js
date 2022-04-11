const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: {type: String, required: true}, // l'identifiant MongoDB unique de l'utilisateur qui a créé la sauce
    name: {type: String, required: true}, //Nom de la sauce 
    manufacturer: {type: String, required: true}, //Fabricant de la sauce 
    description: {type: String, required: true}, // Description de la sauce
    mainPepper: {type: String, required: true}, // Le principal ingrédient épicée de la sauce
    imageUrl: {type: String, required: true}, // l'URL de l'image de la sauce téléchargée par l'utilisateur
    heat: {type: Number, required: true}, // nombre entre 1 et 10 décrivant la sauce
    likes: {type: Number, required: true}, // nombre d'utilisateurs qui aiment (= likent) la sauce
    dislikes: {type: Number, required: true}, //  nombre d'utilisateurs qui n'aiment pas (= dislike) la sauce
    usersLiked: {type: [], required: true}, //["String <userId>"]
    usersDisliked: {type: [], required: true}, //["String <userId>"]
})

module.exports = mongoose.model('Sauce', sauceSchema)