var express = require('express');
var router = express.Router();

router.get('/game/1', function(req, res, next) {
	res.render('index', {color: 'red'});
});

router.get('/game/2', function(req, res, next) {
	res.render('index', {color: 'blue'});
  	next();
});

module.exports = router;
