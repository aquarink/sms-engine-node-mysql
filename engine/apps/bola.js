<<<<<<< HEAD
var jsonfile = require('jsonfile');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment-timezone');
=======
var moment = require('moment-timezone');
const async = require('async');
>>>>>>> 71e5d820a493c980174b013e4c77656d497db056
var CronJob = require('cron').CronJob;
var db = require('../mysql');

var appName = 'bola';

new CronJob('*/1 * * * * *', function () {
<<<<<<< HEAD
    var folder = './files/app/' + appName;
=======
>>>>>>> 71e5d820a493c980174b013e4c77656d497db056
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

<<<<<<< HEAD
                        try {
                            function checkKeyword(keyWord, callback) {
                                db.query('SELECT * FROM tb_keyword WHERE keyword = ?', [keyWord], function (err, keywordData) {
                                    if (!err) {
                                        callback(keywordData);
=======
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
>>>>>>> 71e5d820a493c980174b013e4c77656d497db056
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
<<<<<<< HEAD


                            checkKeyword(nameData[4], function (resKeyword) {
                                if (resKeyword.length > 0) {
                                    for (var i = 0; i < resKeyword.length; i++) {
                                        var idApp = resKeyword[i].id_app;
                                        appConfig(idApp, function (resAppConfig) {

                                            checkSmsPush(nameData[2], dateNow, function (resSmsPush) {
                                                var contentNumber;

                                                // 0 = telco
                                                // 1 = shortcode
                                                // 2 = msisdn
                                                // 3 = sms
                                                // 4 = keyword
                                                // 5 = trxId
                                                // 6 = trxDate
                                                // 7 = dateNow
                                                // 8 = reg
                                                // 9 = sessionID

                                                if (resSmsPush.length === 0) {
                                                    contentNumber = 1;
                                                    var WelPushObj = {
                                                        "telco": nameData[0],
                                                        "shortcode": nameData[1],
                                                        "msisdn": nameData[2],
                                                        "sms_field": nameData[3],
                                                        "keyword": nameData[4],

                                                        "content_number": 0,
                                                        "content_field": "Welcome Message",

                                                        "trx_id": nameData[5],
                                                        "trx_date": nameData[6],
                                                        "session_id": 'w' + nameData[9].split(".")[0],
                                                        "session_date": dateNow,
                                                        "reg_type": nameData[8],

                                                        "type": "pull",
                                                        "cost": 0,
                                                        "send_status": "1"
                                                    };

                                                    makeObjFile(WelPushObj, function (feedBack) {
                                                        if (feedBack === 'if') {
                                                            console.log('[' + dateNow + '] : Create File, Folder & Remove Apps - Welcome Push Ok');
                                                        } else if (feedBack === 'else') {
                                                            console.log('[' + dateNow + '] : Create File & Remove Apps - Welcome Push Ok');
                                                        } else {
                                                            console.log(feedBack);
                                                        }
                                                    });
                                                } else {
                                                    for (var k = 0; k < resSmsPush.length; k++) {
                                                        contentNumber = ((resSmsPush[k].content_number) + 1);
                                                    }
                                                }

                                                getContent(contentNumber, function (resContent) {
                                                    if (resContent.length > 0) {
                                                        for (var l = 0; l < resContent.length; l++) {
                                                            for (var j = 0; j < resAppConfig.length; j++) {
                                                                var pushObj = {
                                                                    "telco": nameData[0],
                                                                    "shortcode": nameData[1],
                                                                    "msisdn": nameData[2],
                                                                    "sms_field": nameData[3],
                                                                    "keyword": nameData[4],

                                                                    "content_number": resContent[l].content_number,
                                                                    "content_field": resContent[l].content_field,

                                                                    "trx_id": "",
                                                                    "trx_date": nameData[6],
                                                                    "session_id": nameData[9].split(".")[0],
                                                                    "session_date": dateNow,
                                                                    "reg_type": nameData[8],

                                                                    "type": "pull",
                                                                    "cost": resAppConfig[j].cost_pull,
                                                                    "send_status": "1"
                                                                };

                                                                makeObjFile(pushObj, function (feedBack) {
                                                                    if (feedBack === 'if') {
                                                                        unlinkFile(files, function (resDel) {
                                                                            if (resDel === 'delOk') {
                                                                                console.log('[' + dateNow + '] : Create File, Folder & Remove Apps - Apps Push Ok');
                                                                            } else {
                                                                                console.log('aa');
                                                                            }
                                                                        });
                                                                    } else if (feedBack === 'else') {
                                                                        unlinkFile(files, function (resDel) {
                                                                            if (resDel === 'delOk') {
                                                                                console.log('[' + dateNow + '] : Create File & Remove Apps - Apps Push Ok');
                                                                            }
                                                                        });
                                                                    } else {
                                                                        console.log(feedBack);
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    } else {
                                                        return contentNumber += 1;
                                                    }
                                                });
                                            });
                                        });
                                    }
                                } else {
                                    console.log('bolaaaaaa');
=======
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
>>>>>>> 71e5d820a493c980174b013e4c77656d497db056
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