var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
//connection to mongodb
mongoose.connect('mongodb://localhost:27017/test');
let Schema = mongoose.Schema;

let userDataSchema = new Schema({
  jobTitle: {type: String, required: true},
  user: String,
}, {collection: 'users'});
//pass in scheman to act as the blueprint of this model
let UserData = mongoose.model('UserData', userDataSchema)

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

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
