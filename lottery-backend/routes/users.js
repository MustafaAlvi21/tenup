var express = require('express');
var router = express.Router();
var User = require('../models/user');
var cors = require('./cors');

router.use(express.json());

router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });

/* GET users listing. */
router.get('/:address', cors.corsWithOptions, async (req, res, next) => {
  const address = req.params.address;
  const userExist = await User.findOne({address: address});

	console.log(userExist);
  if (userExist){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, user: userExist});
  }
  else{
    await User.create({address: req.params.address});
    let created_user = await User.findOne({address: address});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, user: created_user});
  }
});

module.exports = router;
