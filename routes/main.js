var express = require('express');
var router = express.Router();


const MainCtrl = require('../controllers/main');


//searchForBox
router.post('/sloc/upload', MainCtrl.uploadFile);
router.get('/sloc/showIcon/:file_name', MainCtrl.showIcon);


module.exports = router;
