const express = require('express');
const router = express.Router();


const sauceController = require('../controllers/sauce');
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')


router.get('/', auth, sauceController.getAllSauces); // array of sauces
router.get('/:id', auth, sauceController.getOneSauce); // single sauces
router.post('/',auth, multer, sauceController.createSauce); // Post new sauces
router.put('/:id', auth, multer, sauceController.modifySauce) // modifier la sauce
router.delete('/:id', auth, sauceController.deleteSauce) // suppression de sauce
router.post('/:id/like', auth, sauceController.addReact)


module.exports = router;