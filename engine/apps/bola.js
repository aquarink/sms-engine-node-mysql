var jsonfile = require('jsonfile');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var db = require('../mysql');

var appName = 'bola';

new CronJob('*/1 * * * * *', function () {
    var folder = './files/app/' + appName;
    var dateNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD-HH-mm-ss");
    try {

        fs.readdir(folder, function (err, filenames) {
            if (!err) {
                try {
                    filenames.forEach(function (filename) {
                        var files = folder + '/' + filename;
                        var nameData = filename.split("@");
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

                        try {
                            function checkKeyword(keyWord, callback) {
                                db.query('SELECT * FROM tb_keyword WHERE keyword = ?', [keyWord], function (err, keywordData) {
                                    if (!err) {
                                        callback(keywordData);
                                    }
                                });
                            }

                            function getContent(seq, callback) {
                                db.query('SELECT content_number,content_field FROM tb_apps_content WHERE content_number = ?', [seq], function (err, contentData) {
                                    if (!err) {
                                        callback(contentData);
                                    }
                                });
                            }

                            function checkSmsPush(msisdn, sesDate, callback) {
                                db.query('SELECT msisdn,content_number,session_date FROM tb_sms_push WHERE msisdn = ? AND session_date = ?', [msisdn, sesDate], function (err, smsPushData) {
                                    if (!err) {
                                        callback(smsPushData);
                                    }
                                });
                            }

                            function appConfig(appId, callback) {
                                db.query('SELECT * FROM tb_app WHERE id_app = ?', [appId], function (err, appCnfg) {
                                    if (!err) {
                                        callback(appCnfg);
                                    }
                                });
                            }

                            function makeObjFile(obj, callback) {
                                var file = './files/push/' + obj.telco + '/push-' + obj.content_number + '-' + obj.session_id + '.json';
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

                                    checkDirectory('./files/push/' + obj.telco, function (error) {
                                        if (error.code === 'ENOENT') {
                                            mkdirp('./files/push/' + obj.telco, function (err) {
                                                if (!err)
                                                    jsonfile.writeFile(file, obj, {spaces: 2}, function (err) {
                                                        if (!err) {
                                                            callback('if');
                                                        } else {
                                                            callback('if ' + err);
                                                        }
                                                    });
                                                else
                                                    console.log(err);
                                            });
                                        } else {
                                            jsonfile.writeFile(file, obj, {spaces: 2}, function (err) {
                                                if (!err) {
                                                    callback('else');
                                                } else {
                                                    callback('else ' + err);
                                                }
                                            });
                                        }
                                    });
                                } catch (err) {
                                    console.log('error try catch make Obj File');
                                }
                            }

                            function unlinkFile(theFile, callback) {
                                fs.unlink(theFile, function (err) {
                                    if (!err) {
                                        callback('delOk');
                                    } else {
                                        callback(err);
                                    }
                                });
                            }


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
                                }
                            });
                        } catch (err) {
                            console.log('error try catch mo-read query');
                        }
                    });
                } catch (err) {
                    console.log('error try catch mo-read foreach file');
                }
            } else {
                console.log(err);
            }
        });
    } catch (err) {
        console.log('error try catch mo-read dir');
    }
}, null, true, 'Asia/Jakarta');

module.exports = CronJob;