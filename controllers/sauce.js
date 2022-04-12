const fs = require('fs');
const Sauce = require('../models/Sauce');

// création de la sauce
exports.createSauce = async (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  // eslint-disable-next-line no-underscore-dangle
  delete sauceObject._id;
  if (
    typeof sauceObject.name !== 'string'
    || typeof sauceObject.manufacturer !== 'string'
    || typeof sauceObject.description !== 'string'
    || typeof sauceObject.mainPepper !== 'string'
    || typeof sauceObject.heat !== 'number'
  ) {
    return res.status(400).json({ message: 'please provides all fields' });
  }

  const sauceFieldsValidator = [
    sauceObject.name,
    sauceObject.manufacturer,
    sauceObject.description,
    sauceObject.mainPepper,
  ];
  for (let i = 0; i < sauceFieldsValidator.length; i += 1) {
    if (!/^[\wàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ\d '-]+$/.test(sauceFieldsValidator[i])) {
      return res.status(400).json({ message: 'champs invalide' });
    }
  }

  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    userId: req.auth.userId,
  });
  await sauce.save()
    .catch((error) => res.status(400).json({ error }));
  return res.status(201).json({ message: 'Objet enregistré' });
};

// récupération de toute les sauces
exports.getAllSauces = async (req, res) => {
  const sauces = await Sauce.find()
    .catch((error) => res.status(400).json({ error }));
  return res.status(200).json(sauces);
};

// Récupération d'une sauce
exports.getOneSauce = async (req, res) => {
  const sauce = await Sauce.findOne({ _id: req.params.id })
    .catch((error) => res.status(404).json({ error }));
  if (sauce === null) return res.status(404).json({ message: 'sauce inexistante' });
  return res.status(200).json(sauce);
};

// Modification de la sauce
exports.modifySauce = async (req, res) => {
  const sauceModifier = await Sauce.findOne({ _id: req.params.id });
  if (sauceModifier === null) {
    return res.status(404).json({ message: 'sauce inexistante' });
  }
  if (sauceModifier.userId !== req.auth.userId) {
    return res.status(403).json({ message: 'Unauthorized request' });
  }
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : req.body;
  if (
    typeof sauceObject.name !== 'string'
    || typeof sauceObject.manufacturer !== 'string'
    || typeof sauceObject.description !== 'string'
    || typeof sauceObject.mainPepper !== 'string'
    || typeof sauceObject.heat !== 'number'
  ) {
    return res.status(400).json({ message: 'please provides all fields' });
  }
  const sauceFieldsValidator = [
    sauceObject.name,
    sauceObject.manufacturer,
    sauceObject.description,
    sauceObject.mainPepper,
  ];
  for (let i = 0; i < sauceFieldsValidator.length; i += 1) {
    if (!/^[\wàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ\d '-]+$/.test(sauceFieldsValidator[i])) {
      return res.status(400).json({ message: 'champs invalide' });
    }
  }

  await Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .catch((error) => res.status(400).json({ error }));
  return res.status(200).json({ message: 'Objet modifié' });
};

exports.deleteSauce = async (req, res) => {
  const sauce = await Sauce.findOne({ _id: req.params.id })
    .catch((error) => res.status(500).json({ error }));

  if (sauce.userId !== req.auth.userId) return res.status(403).json({ message: 'unauthorized request' });

  const filename = sauce.imageUrl.split('/images/')[1];
  await fs.promises.unlink(`images/${filename}`);
  await Sauce.deleteOne({ _id: req.params.id })
    .catch((error) => res.status(400).json({ error }));
  return res.status(200).json({ message: 'Objet supprimé !' });
};

exports.addReact = async (req, res) => {
  const sauce = await Sauce.findOne({ _id: req.params.id })
    .catch((error) => res.status(400).json({ error }));

  /// récupération du contenu requête
  const demande = req.body.like;

  // vérification des likes de l'user
  const userHasDisliked = sauce.usersDisliked.includes(req.body.userId);
  const userHasLiked = sauce.usersLiked.includes(req.body.userId);

  /// Si l'user a déjà like
  if (userHasLiked === true) {
    switch (demande) {
      case 1: return res.status(409).json({ message: 'already liked' });
      case -1: {
        // ajout du dislike
        sauce.usersDisliked.push(req.body.userId);
        sauce.dislikes = sauce.usersDisliked.length;
        // suppresion du like
        const usersLikedUpdates = sauce.usersLiked.filter((element) => element !== req.body.userId);
        sauce.usersLiked = usersLikedUpdates;
        sauce.likes = sauce.usersLiked.length;
        await sauce.save();

        return res.status(200).json({ message: 'sauce disliked' });
      }
      case 0: {
        const usersLikedUpdates = sauce.usersLiked.filter((element) => element !== req.body.userId);
        sauce.usersLiked = usersLikedUpdates;
        sauce.likes = sauce.usersLiked.length;
        await sauce.save();
        return res.status(200).json({ message: 'like deleted' });
      }
      default: return res.status(400).json({ message: 'inexistant request' });
    }
  }

  /// // si l'user a déjà dislike
  if (userHasDisliked === true) {
    switch (demande) {
      case 1: {
        // ajout du like
        sauce.usersLiked.push(req.body.userId);
        sauce.likes = sauce.usersLiked.length;
        // suppresion du dislike
        const usersDislikedUpdates = sauce.usersLiked.filter((id) => id !== req.body.userId);
        sauce.usersDisliked = usersDislikedUpdates;
        sauce.dislikes = sauce.usersDisliked.length;
        await sauce.save();

        return res.status(200).json({ message: 'sauce liked' });
      }

      case -1: return res.status(409).json({ message: 'already disliked' });

      case 0: {
        // suppression du dislike
        const usersDislikedUpdates = sauce.usersDisliked.filter((id) => id !== req.body.userId);
        sauce.usersDisliked = usersDislikedUpdates;
        sauce.dislikes = sauce.usersDisliked.length;
        await sauce.save();
        return res.status(200).json({ message: 'dislike deleted' });
      }
      default: return res.status(400).json({ message: 'inexistant request' });
    }
  }

  /// / Si l'user n'a pas encore réagit
  switch (demande) {
    case 1:
      // demande de like
      sauce.usersLiked.push(req.body.userId);
      sauce.likes = sauce.usersLiked.length;
      await sauce.save();
      return res.status(201).json({ message: 'sauce liked' });

    case -1:
      // demande de dislike
      sauce.usersDisliked.push(req.body.userId);
      sauce.dislikes = sauce.usersDisliked.length;
      await sauce.save();
      return res.status(201).json({ message: 'sauce disliked' });

    case 0: return res.status(400).json({ message: 'no reaction on this sauce' });

    default: return res.status(400).json({ message: 'inexistant request' });
  }
};
