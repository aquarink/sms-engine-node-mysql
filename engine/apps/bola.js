var jsonfile = require('jsonfile');
var fs = require('fs');
var mkdirp = require('mkdirp');
var CronJob = require('cron').CronJob;
var db = require('../mysql');

var appName = 'bola';

new CronJob('* * * * * *', function () {
    var folder = './files/app/' + appName;
    var dateNow = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(':', '-').replace(':', '-');
    try {

        fs.readdir(folder, function (err, filenames) {
            if (!err) {
                try {
                    filenames.forEach(function (filename) {
                        var files = folder + '/' + filename;
                        fs.readFile(files, 'utf-8', function (err, content) {
                            if (!err) {
                                try {
                                    var contentParse = JSON.parse(content);

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
                                                                    //console.log('[' + dateNow + '] : Create File & Folder Push Ok');
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
                                                            //console.log('[' + dateNow + '] : Create File Push Ok');
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


                                    checkKeyword(appName, function (resKeyword) {
                                        if (resKeyword.length > 0) {
                                            for (var i = 0; i < resKeyword.length; i++) {
                                                var idApp = resKeyword[i].id_app;
                                                appConfig(idApp, function (resAppConfig) {

                                                    checkSmsPush(contentParse.msisdn, contentParse.session_date, function (resSmsPush) {
                                                        var contentNumber;

                                                        if (resSmsPush.length === 0) {
                                                            contentNumber = 1;
                                                            var WelPushObj = {
                                                                "telco": contentParse.telco,
                                                                "shortcode": contentParse.shortcode,
                                                                "msisdn": contentParse.msisdn,
                                                                "sms_field": contentParse.sms_field,
                                                                "keyword": contentParse.keyword,

                                                                "content_number": 0,
                                                                "content_field": "Welcome Message",

                                                                "trx_id": contentParse.trx_id,
                                                                "trx_date": contentParse.trx_date,
                                                                "session_id": 'w' + contentParse.session_id,
                                                                "session_date": contentParse.session_date,
                                                                "reg_type": contentParse.reg_type,

                                                                "type": "pull",
                                                                "cost": 0,
                                                                "send_status": "1"
                                                            };

                                                            makeObjFile(WelPushObj, function (feedBack) {
                                                                if (feedBack === 'if') {
                                                                    console.log('[' + dateNow + '] : Create File, Folder & Remove Apps - Welcome Push Ok');
//                                                                    unlinkFile(files, function (resDel) {
//                                                                        if (resDel === 'delOk') {
//                                                                            console.log('[' + dateNow + '] : Create File, Folder & Remove Apps - Welcome Push Ok');
//                                                                        }
//                                                                    });
                                                                } else if (feedBack === 'else') {
                                                                    console.log('[' + dateNow + '] : Create File & Remove Apps - Welcome Push Ok');
//                                                                    unlinkFile(files, function (resDel) {
//                                                                        if (resDel === 'delOk') {
//                                                                            console.log('[' + dateNow + '] : Create File & Remove Apps - Welcome Push Ok');
//                                                                        }
//                                                                    });
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
                                                                            "telco": contentParse.telco,
                                                                            "shortcode": contentParse.shortcode,
                                                                            "msisdn": contentParse.msisdn,
                                                                            "sms_field": contentParse.sms_field,
                                                                            "keyword": contentParse.keyword,

                                                                            "content_number": resContent[l].content_number,
                                                                            "content_field": resContent[l].content_field,

                                                                            "trx_id": "",
                                                                            "trx_date": contentParse.trx_date,
                                                                            "session_id": contentParse.session_id,
                                                                            "session_date": contentParse.session_date,
                                                                            "reg_type": contentParse.reg_type,

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
                                                                                    } else {
                                                                                        console.log('bb');
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
                                        }
                                    });
                                } catch (err) {
                                    console.log('error try catch mo-read query');
                                }

                            } else {
                                console.log(err);
                            }
                        });
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