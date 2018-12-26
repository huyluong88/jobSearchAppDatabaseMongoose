var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
//connection to mongodb
mongoose.connect('mongodb://admin:admin1@ds237574.mlab.com:37574/jobs');
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

let jobInfoSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  jobId: String,
  location: Array,
  organization_name: String,
  position_title: String,
  url: String,
  start_date: String,
  end_date: String,
  ad: Date,
  au: String,
  userId: String,
}, {collection: 'savedJobs'});
//pass in scheman to act as the blueprint of this model
let UserData = mongoose.model('UserData', userDataSchema);
let JobInfoData = mongoose.model('JobInfoData', jobInfoSchema);

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

router.post('/save-job', (req, res, next) => {
  let job = new JobInfoData({
    _id: new mongoose.Types.ObjectId(),
    jobId: req.body.jobId,
    location: req.body.locations,
    organization_name: req.body.organization_name,
    position_title: req.body.position_title,
    url: req.body.url,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    ad: new Date(),
    au: req.body.email,
    userId: req.body.userId,
  })
  console.log(job);
  // console.log(req.body);
  job.save((err, user) => {
    if (err) {
      return res.json(err);
    }
    return res.status(201).json({message: 'job added'})
  })
})

//sign in
router.post('/login', (req, res, next) => {
  console.log('login called ', req.body);
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
