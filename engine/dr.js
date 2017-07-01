var express = require('express');
var jsonfile = require('jsonfile');
var fs = require('fs');
var mkdirp = require('mkdirp');
var objId = require('mongodb').ObjectID;
var router = express.Router();

/* GET home page. */
router.get('/:telco', function (req, res, next) {

    res.send('a');
    //console.log(req.query);
    if (JSON.stringify(req.query) !== '{}') {
        var telco = req.params.telco;
        var shortcode = req.query.shortcode;
        var msisdn = req.query.msisdn;
        var trxId = req.query.trxid;
        var trxDate = req.query.trxdate;
        var stat = req.query.stat;
        var dateNow = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        // Parsing msisdn 0 = 62
        var msisdnNew;

        if (msisdn.slice(0, 2) === '62') {
            msisdnNew = msisdn;
        } else {
            msisdnNew = '62' + msisdn.slice(1);
        }

        // SMS Object
        var smsObj = {
            telco: telco,
            shortcode: shortcode,
            msisdn: msisdnNew,
            trx_id: trxId,
            trx_date: trxDate,
            session_id: new objId(),
            session_date: dateNow,
            stat: stat
        };

        var file = './files/dr/DR-' + new objId() + '.json';

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
                            jsonfile.writeFile(file, smsObj, {spaces: 2}, function (err) {
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
                    jsonfile.writeFile(file, smsObj, {spaces: 2}, function (err) {
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
