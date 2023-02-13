const Sauce = require('../models/Sauce')
const fs = require('fs')

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
    .catch((error) => { res.status(400).json({ error })})
}

// modification du post
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body }
  
    delete sauceObject._userId
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé'})
            } else {
                Sauce.updateOne(
                    { _id: req.params.id}, 
                    { ...sauceObject, _id: req.params.id}
                )
                .then(() => res.status(200).json({message : 'Sauce modifiée avec succès !'}))
                .catch((error) => res.status(401).json({ error }))
            }
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

// delete post
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé'})
            } else {
                const filename = sauce.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                        .catch((error) => res.status(401).json({ error }))
                })
            }
        })
        .catch( error => {
            res.status(500).json({ error })
        })
}

// like and dislike 
exports.likeSauce = (req, res, next) => {
    // récupération like dans body
    const like = req.body.like
    // récupération userId dans body
    const userId = req.body.userId

    // si l'utilisateur like
    if (like === 1) {
      Sauce.updateOne({_id: req.params.id},{$push: { usersLiked: userId }, $inc: {likes: 1}})
      .then(() => res.status(200).json({ message: "Votre like a été pris en compte!" }))
      .catch(error => res.status(400).json({ error: error }));
    }
    // si l'utilisateur dislike
    else if (like === -1) {
      Sauce.updateOne({_id: req.params.id}, {$push: { usersDisliked: userId }, $inc: {dislikes: 1}})
      .then(() => res.status(200).json({message: "Votre dislike a été pris en compte!"}))
      .catch(error => res.status(400).json({ error: error }))
    }
    // si l'utilisateur enlève son like ou son dislike 
    else if (like === 0) {
      Sauce.findOne({_id: req.params.id})
      .then(sauce => {
        // si l'utilisateur enlève son like
        if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne({_id: req.params.id}, {$inc: {likes: -1}, $pull: {usersLiked: userId}}) 
            .then(() => res.status(200).json({ message: "Votre like à bien été supprimé" }))
            .catch(error => res.status(400).json({ error: error }));
          }
        // si l'utilisateur enlève son dislike
        if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: -1}, $pull: {usersDisliked: userId}})
            .then(() => res.status(200).json({ message: "Votre dislike à bien été supprimé" }))
            .catch(error => res.status(400).json({ error: error }))
        }
      })
    .catch(error => res.status(500).json({ error: error }))
    }
  }

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => res.status(200).json(sauce))
      .catch((error) => res.status(404).json({ error }))
}

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }))
}