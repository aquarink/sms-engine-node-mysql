var express = require('express');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment-timezone');
var objId = require('mongodb').ObjectID;
var router = express.Router();

/* GET home page. */
router.get('/:telco', function (req, res, next) {

    res.send('ok');
    //console.log(req.query);
    if (JSON.stringify(req.query) !== '{}') {
        var telco = req.params.telco;
        var shortcode = req.query.shortcode;
        var msisdn = req.query.msisdn;
        var trxId = req.query.trxid;
        var trxDate = req.query.trxdate;
        var stat = req.query.stat;
        
        var dateNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD-HH-mm-ss");

        // Parsing msisdn 0 = 62
        var msisdnNew;

        if (msisdn.slice(0, 2) === '62') {
            msisdnNew = msisdn;
        } else {
            msisdnNew = '62' + msisdn.slice(1);
        }

        var file = './files/dr/' + telco + '@' + shortcode + '@' + msisdnNew + '@' + trxId + '@' + trxDate + '@' + stat + '@' + dateNow + '@' + new objId() + '.txt';

        //Check Folder Exist
        try {
            function checkDirectory(directory, callback) {
                fs.stat(directory, function (err, stats) {
                    if (err) {
                        callback(err);
                    } else {
                        callback('ok');
                    }
                });
            }

            checkDirectory('./files/dr', function (error) {
                if (error.code === 'ENOENT') {
                    mkdirp('./files/dr', function (err) {
                        if (!err)
                            fs.writeFile(file, "", function (err) {
                                if (!err) {
                                    console.log('[' + dateNow + '] : Create File & Folder DR Ok');
                                } else {
                                    console.log(err);
                                }
                            });
                        else
                            console.log(err);
                    });
                } else {
                    fs.writeFile(file, "", function (err) {
                        if (!err) {
                            console.log('[' + dateNow + '] : Create File DR Ok');
                        } else {
                            console.log(err);
                        }
                    });
                }
            });
        } catch (err) {
            console.log('error try catch dr');
        }
    }
});

module.exports = router;
