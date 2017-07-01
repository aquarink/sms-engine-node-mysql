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
        var keyword;
        var reg;

        var telco = req.params.telco;
        var shortcode = req.query.shortcode;
        var msisdn = req.query.msisdn;
        var sms = req.query.sms;
        var trxId = req.query.trxid;
        var trxDate = req.query.trxdate;
        var dateNow = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(':', '-').replace(':', '-');

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

        // SMS Object
        var smsObj = {
            telco: telco,
            shortcode: shortcode,
            msisdn: msisdnNew,
            sms_field: sms,
            keyword: keyword,
            trx_id: trxId,
            trx_date: trxDate,
            session_id: new objId(),
            session_date: dateNow,
            reg_type: reg
        };

        //var file2 = telco + '_' + shortcode + '_' + msisdnNew + '_' + sms + '_' + keyword + '_' + trxId + '_' + trxDate + '_' + new objId() + '_' + dateNow + '_' + reg + '.json';
        var file = './files/mo/MO-' + new objId() + '.json';

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
                            jsonfile.writeFile(file, smsObj, {spaces: 2}, function (err) {
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
                    jsonfile.writeFile(file, smsObj, {spaces: 2}, function (err) {
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
