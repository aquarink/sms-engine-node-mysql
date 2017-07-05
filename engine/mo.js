var express = require('express');
var fs = require('fs');
var mkdirp = require('mkdirp');
var objId = require('mongodb').ObjectID;
var router = express.Router();

/* GET home page. */
router.get('/:telco', function (req, res, next) {

    res.send('ok');
    //console.log(req.query);
    if (JSON.stringify(req.query) !== '{}') {
        var keyword;
        var reg;

        var telco = req.params.telco;
        var shortcode = req.query.shortcode;
        var msisdn = req.query.msisdn;
        var sms = req.query.sms;
        var trxId = req.query.trxid;
        var trxDate = req.query.trxdate;
        var dateNow = new Date().toISOString().slice(0,10);
        var smsExplode = sms.split(" ");
        if (smsExplode[0] === 'reg') {
            keyword = smsExplode[1].replace(/\s+/g, '');
            reg = 1;
        } else if (smsExplode[0] === 'unreg') {
            keyword = smsExplode[1].replace(/\s+/g, '');
            reg = 2;
        } else {
            keyword = smsExplode[0].replace(/\s+/g, '');
            reg = 1;
        }

        // Parsing msisdn 0 = 62
        var msisdnNew;

        if (msisdn.slice(0, 2) === '62') {
            msisdnNew = msisdn;
        } else {
            msisdnNew = '62' + msisdn.slice(1);
        }

        var file = './files/mo/' + telco + '@' + shortcode + '@' + msisdnNew + '@' + sms + '@' + keyword + '@' + trxId + '@' + trxDate + '@' + dateNow + '@' + reg + '@' + new objId() + '.txt';

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

            checkDirectory('./files/mo', function (error) {
                if (error.code === 'ENOENT') {
                    mkdirp('./files/mo', function (err) {
                        if (!err)
                            fs.writeFile(file, "", function (err) {
                                if (!err) {
                                    console.log('[' + dateNow + '] : Create File & Folder MO Ok');
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
                            console.log('[' + dateNow + '] : Create File MO Ok');
                        } else {
                            console.log(err);
                        }
                    });
                }
            });
        } catch (err) {
            console.log('error try catch mo');
        }
    }
});

module.exports = router;
