var fs = require('fs');
var mkdirp = require('mkdirp');
const async = require('async');
var reQuest = require('request');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var db = require('../mysql');

var telcoName = 'xl';

new CronJob('*/1 * * * * *', function () {
    var dateNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD-HH-mm-ss");

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

                                async.map(two, function (dataPush, callback) {
                                    if (dataPush.data.trx_id === '') {
                                        dataPush.data.trx_id = dataPush.body;

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