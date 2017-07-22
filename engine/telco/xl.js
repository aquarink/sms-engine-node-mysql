var fs = require('fs');
var mkdirp = require('mkdirp');
const async = require('async');
var reQuest = require('request');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var db = require('../mysql');

var telcoName = 'xl';

<<<<<<< HEAD
new CronJob('*/2 * * * * *', function () {
    var folder = './files/push/' + telcoName;
    //var dateNow = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(':', '-').replace(':', '-');
    var dateNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD-HH-mm-ss");
    try {
=======
new CronJob('*/1 * * * * *', function () {
    var dateNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD-HH-mm-ss");
>>>>>>> 71e5d820a493c980174b013e4c77656d497db056

    try {
        db.query('SELECT * FROM tb_telco_config WHERE telco_name = ?', [telcoName], function (err, telcoConfig) {
            if (!err) {
                db.query('SELECT * FROM tb_sms_push_temp WHERE telco = ? LIMIT ?', [telcoName, telcoConfig[0].push_limit], function (err, smsPushData) {
                    if (!err) {
                        async.map(smsPushData, function (data, cb) {
                            var link = telcoConfig[0].address + '?username=' + telcoConfig[0].username + '&password=' + telcoConfig[0].password + '&msisdn=' + data.msisdn + '&trxid=' + data.trx_id + '&serviceId=' + data.cost + '&sms=' + data.content_field + '&shortname=1212121212';

                            reQuest(link, (requestErr, response, body) => {
                                if (!requestErr) {
                                    if (response.statusCode === 200) {
                                        const newData = {
                                            'data': data,
                                            body
                                        };
                                        cb(null, newData);
                                    } else {
                                        cb('not200');
                                    }
                                } else {
                                    cb('requestErr');
                                }
                            });
                        }, (one, two) => {
                            if (one === 'not200' || one === 'requestErr') {
                                console.log('Error 200 or Error Request');
                            } else {

<<<<<<< HEAD
                                            if (fileSizeInBytes > 100) {
                                                try {
                                                    var contentParse = JSON.parse(content);
                                                    var link = resTelConf[0].address + '?username=' + resTelConf[0].username + '&password=' + resTelConf[0].password + '&msisdn=' + contentParse.msisdn + '&trxid=' + contentParse.trx_id + '&serviceId=' + contentParse.cost + '&sms=' + contentParse.content_field + '&shortname=1212121212';
                                                    
                                                    unlinkFile(folder + '/' + data, function (resDel) {
                                                        if (resDel === 'deleteOk') {
                                                            hitTelco(link, function (resHit) {
                                                                if (resHit.body !== 'ok') {
                                                                    contentParse.trx_id = resHit.body;
                                                                }
=======
                                async.map(two, function (dataPush, callback) {
                                    if (dataPush.data.trx_id === '') {
                                        dataPush.data.trx_id = dataPush.body;
>>>>>>> 71e5d820a493c980174b013e4c77656d497db056

                                        db.query('DELETE FROM tb_sms_push_temp WHERE session_id = ?', [dataPush.data.session_id], function (err, resDelete) {
                                            if (!err) {
                                                db.query('INSERT INTO tb_sms_push SET ?', [dataPush.data], function (err, resInsert) {
                                                    if (!err) {
                                                        console.log('[' + dateNow + '] : Push Content Message & Delete Push Temp if Ok');
                                                    } else {
                                                        console.log('err insert if');
                                                    }
                                                });
                                            } else {
                                                console.log('err delete if');
                                            }
                                        });
                                    } else {
                                        db.query('DELETE FROM tb_sms_push_temp WHERE session_id = ?', [dataPush.data.session_id], function (err, resDelete) {
                                            if (!err) {
                                                db.query('INSERT INTO tb_sms_push SET ?', [dataPush.data], function (err, resInsert) {
                                                    if (!err) {
                                                        console.log('[' + dateNow + '] : Push Content Message & Delete Push Temp Else Ok');
                                                    } else {
                                                        console.log('err insert else');
                                                    }
                                                });
                                            } else {
                                                console.log('err delete else');
                                            }
                                        });

                                    }
                                });

//                                for (var i = 0; i < two.length; i++) {
//                                    if (two[i].data.trx_id === '') {
//
//                                        two[i].data.trx_id = two[i].body;
//                                        
//                                        db.query('INSERT INTO tb_sms_push SET ?', [two[i].data], function (err, resInsert) {
//                                            if (!err) {
//                                                db.query('DELETE FROM tb_sms_push_temp WHERE session_id = ?', [two[i].data.session_id], function (err, resDelete) {
//                                                    if (!err) {
//                                                        console.log('[' + dateNow + '] : Push Content Message & Delete Push Temp Ok');
//                                                    } else {
//                                                        console.log('err delete');
//                                                    }
//                                                });
//                                            } else {
//                                                console.log(err);
//                                            }
//                                        });
//                                    }
//                                }
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        console.log('error try catch mo-read dir');
    }
}, null, true, 'Asia/Jakarta');

module.exports = CronJob;