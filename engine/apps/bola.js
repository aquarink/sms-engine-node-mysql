var moment = require('moment-timezone');
const async = require('async');
var CronJob = require('cron').CronJob;
var db = require('../mysql');

var appName = 'bola';

new CronJob('*/1 * * * * *', function () {
    var dateNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD-HH-mm-ss");
    try {

        function insertPush(obj, callback) {
            db.query('INSERT INTO tb_sms_push_temp SET ?', [obj], function (err, resInsert) {
                if (!err) {
                    callback('insertOk');
                } else {
                    callback(err);
                }
            });
        }

        function getContent(seq, callback) {
            db.query('SELECT content_number,content_field FROM tb_apps_content WHERE content_number = ?', [seq], function (err, contentData) {
                if (!err) {
                    callback(contentData);
                } else {
                    callback('err');
                }
            });
        }

        db.query('SELECT * FROM tb_mo_temp WHERE keyword = ?', [appName], function (err, moTemp) {
            if (!err) {
                async.map(moTemp, function (data, cb) {
                    db.query('SELECT content_number FROM tb_sms_push WHERE telco = ? AND shortcode = ? AND msisdn = ? AND keyword = ? AND session_date = ? ORDER BY id_push DESC LIMIT 1', [data.telco, data.shortcode, data.msisdn, data.keyword, data.session_date], function (err, smsPushData) {
                        if (!err) {
                            if (smsPushData.length === 0) {
                                // Welcome Message
                                var WelPushObj = {
                                    "telco": data.telco,
                                    "shortcode": data.shortcode,
                                    "msisdn": data.msisdn,
                                    "sms_field": data.sms_field,
                                    "keyword": data.keyword,

                                    "content_number": 0,
                                    "content_field": "Welcome Message",

                                    "trx_id": data.trx_id,
                                    "trx_date": data.trx_date,
                                    "session_id": 'w-' + data.session_id,
                                    "session_date": data.session_date,
                                    "reg_type": data.reg_type,

                                    "type": "pull",
                                    "cost": 0,
                                    "send_status": "1"
                                };

                                insertPush(WelPushObj, function (resInsert) {
                                    if (resInsert === 'insertOk') {
                                        console.log('[' + dateNow + '] : Make Welcome Message Ok');
                                    }
                                });

                                db.query('SELECT content_number,content_field FROM tb_apps_content WHERE content_number = ?', [1], function (err, content) {
                                    if (!err) {
                                        db.query('SELECT * FROM tb_keyword WHERE keyword = ?', [appName], function (err, keywordData) {
                                            if (!err) {
                                                db.query('SELECT * FROM tb_app_config WHERE id_app = ?', [keywordData[0].id_app], function (err, appConfig) {
                                                    if (!err) {
                                                        var pushSms = {
                                                            "telco": data.telco,
                                                            "shortcode": data.shortcode,
                                                            "msisdn": data.msisdn,
                                                            "sms_field": data.sms_field,
                                                            "keyword": data.keyword,

                                                            "content_number": content[0].content_number,
                                                            "content_field": content[0].content_field,

                                                            "trx_id": "",
                                                            "trx_date": data.trx_date,
                                                            "session_id": data.session_id,
                                                            "session_date": dateNow,
                                                            "reg_type": data.reg_type,

                                                            "type": "pull",
                                                            "cost": appConfig[0].cost_pull,
                                                            "send_status": "1"
                                                        };

                                                        cb(null, pushSms);
                                                    }
                                                });
                                            }
                                        });

                                    } else {
                                        console.log('err get content 1');
                                    }
                                });
                            } else {
                                var contentSeq = smsPushData[0].content_number + 1;

                                db.query('SELECT content_number,content_field FROM tb_apps_content WHERE content_number = ?', [contentSeq], function (err, content) {
                                    if (!err) {
                                        db.query('SELECT * FROM tb_keyword WHERE keyword = ?', [appName], function (err, keywordData) {
                                            if (!err) {
                                                db.query('SELECT * FROM tb_app_config WHERE id_app = ?', [keywordData[0].id_app], function (err, appConfig) {
                                                    if (!err) {
                                                        var pushSms = {
                                                            "telco": data.telco,
                                                            "shortcode": data.shortcode,
                                                            "msisdn": data.msisdn,
                                                            "sms_field": data.sms_field,
                                                            "keyword": data.keyword,

                                                            "content_number": content[0].content_number,
                                                            "content_field": content[0].content_field,

                                                            "trx_id": "",
                                                            "trx_date": data.trx_date,
                                                            "session_id": data.session_id,
                                                            "session_date": dateNow,
                                                            "reg_type": data.reg_type,

                                                            "type": "pull",
                                                            "cost": appConfig[0].cost_pull,
                                                            "send_status": "1"
                                                        };

                                                        cb(null, pushSms);
                                                    }
                                                });
                                            }
                                        });

                                    } else {
                                        console.log('err get content 2');
                                    }
                                });
                            }
                        } else {
                            console.log('sms push data search error');
                        }
                    });
                }, (one, two) => {
                    insertPush(two[0], function (resInsert) {
                        if (resInsert === 'insertOk') {
                            db.query('DELETE FROM tb_mo_temp WHERE session_id = ?', [two[0].session_id], function (err, resDelete) {
                                if (!err) {
                                    console.log('[' + dateNow + '] : Make Content Message & Delete MO Temp Ok');
                                }
                            });
                        }
                    });
                });
            } else {
                console.log('keyword search error');
            }
        });

    } catch (err) {
        console.log('error try catch ' + appName);
    }
}, null, true, 'Asia/Jakarta');

module.exports = CronJob;