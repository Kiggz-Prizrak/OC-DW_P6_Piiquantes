const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string' ) {
        return res.status(400).json({message : "please provides all fields"})
    }


    if(!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[_.@$!%*#?&])[A-Za-z\d_.@$!%*#?&]{8,}$/.test(req.body.password)) {
        return res.status(400).json({message: "mot de passe invalide"})
    } 




    // cryptage du mot de passe 
    const hash = await bcrypt.hash(req.body.password, 10)
    // création de l'user
    const user = new User({
        email: req.body.email,
        password: hash
    });
    if(!/^[\w\d.+-]+@[\w.-]+\.[a-z]{2,}$/.test(req.body.email)) {
        return res.status(400).json({message: "email invalide"})
    } 
    // enregistrement de l'utilisateur sur la BDD
    await user.save() 
        .catch(error => res.status(400).json({ error }));
    return res.status(201).json({message: 'Utilisateur créé'})
};

// Connexion de l'utilisateur 
exports.login = async (req, res, next) => {
    if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string' ) {
        return res.status(400).json({message : "please provides all fields"})
    }

    const user = await User.findOne({email: req.body.email})
        .catch(error => res.status(500).json({ error }))
    if (!user) {
        return res.status(404).json({error : "Utilisateur non trouvé"})
    }
    // comparaison du hache du MDP de la BDD et le MDP entré
    const valid = await bcrypt.compare(req.body.password, user.password)
        .catch(error =>res.status(500).json({ error }));
    //Si valeur non correspondante
    if (!valid) {
        return res.status(400).json({error :"Mot de passe incorrecte"})
    }
    // si validation -> creation de token
    res.status(200).json({
        userId: user._id,
        token: jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_TOKEN,
            { expiresIn:'24h' }
        )
    });
};

// Liste  des users
exports.getAllUsers = async (req, res) => {
    const users = await User.find()
        .catch (error => res.status(404).json({error}))
    return res.status(200).json(users)
}

// récupérer un user
exports.getOneUser = async (req, res) => {
    const user = await User.findOne({_id: req.params.id})
        .catch(error => res.status(404).json({error}))
    return res.status(200).json(user)
}

// Modifier un user 
exports.modifyUser = async (req, res) => {
    const userModifier = await User.findOne({_id: req.params.id})
    if (userModifier === null) {
        return res.status(404).json({message: "User not found"})
    }
    if (userModifier._id != req.auth.userId) {
        return res.status(403).json({message : "Unauthorized request"})
    }
    console.log(req.body)
    const userObject = req.file ?{
        ...JSON.parse(req.body)
    } : req.body

    if(!/^[\w\d.+-]+@[\w.-]+\.[a-z]{2,}$/.test(req.body.email)) {
        return res.status(400).json({message: "email invalide"})
    } 


    userObject.password = await bcrypt.hash(userObject.password, 10)
    if ( typeof userObject.email !== "string" || typeof userObject.password !== "string") {
        return res.status(400).json({message : "please provides all fields"})
    } 
    await User.updateOne({_id: req.params.id}, {...userObject, _id: req.params.id})
        .catch(error => res.status(400).json({error}))
    return res.status(200).json({message : "User modifié"})
}


exports.deleteUser = async (req, res) => {
    const user = await User.findOne({_id : req.params.id})
    if (user === null) {
        return res.status(404).json({message: "User not found"})
    }
    if (user._id != req.auth.userId) {
        return res.status(403).json({message : "Unauthorized request"})
    }
    await user.deleteOne({_id : req.params.id})
        .catch(error => res.status(400).json({error}))
    return res.status(200).json({ message : "user deleted"})
}
