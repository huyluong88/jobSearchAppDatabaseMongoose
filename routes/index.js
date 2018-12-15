var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
//connection to mongodb
mongoose.connect('mongodb://localhost:27017/test');
let Schema = mongoose.Schema;

let userDataSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
      type: String,
      required: true,
      unique: true,
      match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
  password: {type: String, required: true},
}, {collection: 'users'});
//pass in scheman to act as the blueprint of this model
let UserData = mongoose.model('UserData', userDataSchema)

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

//sign up
router.post('/signup', (req, res, next) => {
  UserData.find({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.sendStatus(500).json(err);
    }
    if (user.length >= 1) {
      return res.status(409).json({message: 'email already exists'})
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.sendStatus(500).json({err});
        } else {
          let user = new UserData({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash,
          })
          user.save((err, user) => {
            if (err) {
              return res.json(err);
            }
            return res.status(201).json({message: 'User created'});
          })
        }
      })
    }
  })
})

//sign in
router.post('/login', (req, res, next) => {
  UserData.find({ email: req.body.email }, (err, user) => {
    console.log('user ', user);
    if (err) {
      return res.sendStatus(500).json(err);
    }
    if (user.length < 1) {
      return res.status(401).json({message: 'Auth failed'})
    } else {
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({message: 'Auth failed'})
        }
        //creates a jwt token if the password matches
        if (result) {
          let token = jwt.sign(
            {
              email: user[0].email,
              id: user[0]._id,
            },
            'secret',
            {
              expiresIn: "1h"
            }
        )
          return res.status(200).json({
            message: 'Auth successful',
            token: token
          })
        } else {
          return res.status(401).json({message: 'Auth failed. Incorrect password'})
        }
      })
    }
  })
})

router.get('/get-data', (req, res, next) => {
  UserData.find((err, users) => {
    if (err) {
      return res.json(err);
    }
    return res.json(users)
  })
  .catch((err) => {
    return res.json(err);
  })
})

router.post('/insert', (req, res, next) => {
  let jobItem = {
    jobTitle: req.body.jobTitle,
    user: req.body.user,
  }
  let data = new UserData(jobItem);
  //storing it to the DB
  data.save((err, user) => {
    if (err) {
      return res.json(err);
    }
    return res.sendStatus(201);
  })
})

router.post('/delete', (req, res, next) => {
  let id = req.body.id;
  UserData.findByIdAndRemove(id, (err, result) => {
    if (err) {
      return res.json(err);
    }
    return res.sendStatus(204);
  }).exec();
})

module.exports = router;
