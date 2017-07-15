var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var db = require('./mysql');

new CronJob('* * * * * *', function () {
    var folder = './files/mo/';
    var dateNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD-HH-mm-ss");
    try {

        fs.readdir(folder, function (err, filenames) {
            if (!err) {
                try {
                    filenames.forEach(function (filename) {
                        var nameData = filename.split("@");
                        // 0 = telco
                        // 1 = shortcode
                        // 2 = msisdn
                        // 3 = sms
                        // 4 = keyword
                        // 5 = trxId
                        // 6 = trxDate
                        // 7 = sessionDate
                        // 8 = reg
                        // 9 = sessionID
                        
                         var sessionID = nameData[9].split(".")[0];

                        try {
                            db.query('SELECT * FROM tb_keyword WHERE keyword = ?', [nameData[4]], function (err, results) {
                                if (!err) {
                                    if (results.length > 0) {
                                        for (var i = 0; i < results.length; i++) {
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

                                                db.query('SELECT * FROM tb_members WHERE telco = ? AND msisdn = ? AND shortcode = ? AND app = ?', [nameData[0], nameData[2], nameData[1], nameData[4]], function (err, checkData) {
                                                    if (!err) {
                                                        if (checkData.length > 0) {
                                                            for (var j = 0; j < checkData.length; j++) {
                                                                if (checkData[j].reg_type === 'unreg') {
                                                                    db.query('UPDATE tb_members SET reg_type = "reg" WHERE id_member = ?', [checkData[j].id_member], function (err, results) {
                                                                        if (!err) {
                                                                            console.log('[' + dateNow + '] : Update Member Unreg Ok');
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        } else {
                                                            // Insert New Memeber
                                                            db.query('INSERT INTO tb_members (telco,shortcode,msisdn,app,join_date,reg_types) VALUES(?,?,?,?,?,?)', [nameData[0], nameData[1], nameData[2], nameData[4], nameData[7], nameData[8]], function (err, resInsertMember) {
                                                                if (!err) {
                                                                    console.log('[' + dateNow + '] : Insert New Member Ok');
                                                                } else {
                                                                    console.log(err);
                                                                }
                                                            });
                                                        }
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });
                                                checkDirectory('./files/app/' + nameData[4], function (error) {
                                                    if (error.code === 'ENOENT') {
                                                        mkdirp('./files/app/' + nameData[4], function (err) {
                                                            if (!err)
                                                                fs.rename(folder + filename, './files/app/' + nameData[4] + '/' + filename, function (err) {
                                                                    if (!err) {
                                                                        db.query('INSERT INTO tb_mo (telco,shortcode,msisdn,sms_field,keyword,trx_id,trx_date,session_id,session_date,reg_type) VALUES(?,?,?,?,?,?,?,?,?,?)',
                                                                                [nameData[0], nameData[1], nameData[2], nameData[3], nameData[4], nameData[5], nameData[6], sessionID, nameData[7], nameData[8]], function (err, resInsert) {
                                                                            if (!err) {
                                                                                console.log('[' + dateNow + '] : Make Dir, Move File MO & Insert MO Log If Ok');
                                                                            } else {
                                                                                console.log(err);
                                                                            }
                                                                        });
                                                                    } 
//                                                                    else {
//                                                                        console.log(err);
//                                                                    }
                                                                });
                                                            else
                                                                console.log(err);
                                                        });
                                                    } else {
                                                        fs.rename(folder + filename, './files/app/' + nameData[4] + '/' + filename, function (err) {
                                                            if (!err) {
                                                                db.query('INSERT INTO tb_mo (telco,shortcode,msisdn,sms_field,keyword,trx_id,trx_date,session_id,session_date,reg_type) VALUES(?,?,?,?,?,?,?,?,?,?)',
                                                                        [nameData[0], nameData[1], nameData[2], nameData[3], nameData[4], nameData[5], nameData[6], sessionID, nameData[7], nameData[8]], function (err, resInsert) {
                                                                    if (!err) {
                                                                        console.log('[' + dateNow + '] : Move File MO & Insert MO Log Else Ok');
                                                                    } else {
                                                                        console.log(err);
                                                                    }
                                                                });
                                                            } 
//                                                            else {
//                                                                console.log(err);
//                                                            }
                                                        });
                                                    }
                                                });
                                            } catch (err) {
                                                console.log('error try catch mo-read create App folder');
                                            }
                                        }
                                    } else {
                                        // Wrong Keyword
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

                                            checkDirectory('./files/app/others', function (error) {
                                                if (error.code === 'ENOENT') {
                                                    mkdirp('./files/app/others', function (err) {
                                                        if (!err)
                                                            fs.rename(folder + filename, './files/app/others/' + filename, function (err) {
                                                                if (!err) {
                                                                    // Insert To MO Log
                                                                    db.query('INSERT INTO tb_mo (telco,shortcode,msisdn,sms_field,keyword,trx_id,trx_date,session_id,session_date,reg_type) VALUES(?,?,?,?,?,?,?,?,?,?)',
                                                                            [nameData[0], nameData[1], nameData[2], nameData[3], nameData[4], nameData[5], nameData[6], sessionID, dateNow, nameData[8]], function (err, resInsert) {
                                                                        if (!err) {
                                                                            console.log('[' + dateNow + '] : Make Dir, Move File MO to Wrong Keyword & Insert MO Log If Ok');
                                                                        } else {
                                                                            console.log(err);
                                                                        }
                                                                    });
                                                                } 
//                                                                else {
//                                                                    console.log(err);
//                                                                }
                                                            });
                                                        else
                                                            console.log(err);
                                                    });
                                                } else {
                                                    fs.rename(folder + filename, './files/app/others/' + filename, function (err) {
                                                        if (!err) {
                                                            // Insert To MO Log
                                                            db.query('INSERT INTO tb_mo (telco,shortcode,msisdn,sms_field,keyword,trx_id,trx_date,session_id,session_date,reg_type) VALUES(?,?,?,?,?,?,?,?,?,?)',
                                                                    [nameData[0], nameData[1], nameData[2], nameData[3], nameData[4], nameData[5], nameData[6], sessionID, dateNow, nameData[8]], function (err, resInsert) {
                                                                if (!err) {
                                                                    console.log('[' + dateNow + '] : Move File MO to Wrong Keyword & Insert MO Log Else Ok');
                                                                } else {
                                                                    console.log(err);
                                                                }
                                                            });
                                                        } 
//                                                        else {
//                                                            console.log(err);
//                                                        }
                                                    });
                                                }
                                            });
                                        } catch (err) {
                                            console.log('error try catch mo-read create Wrong Keyword folder');
                                        }
                                    }
                                } else {
                                    console.log(err);
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
                // console.log(err); // Tiak ada folder atau file
            }
        });
    } catch (err) {
        console.log('error try catch mo-read dir');
    }
}, null, true, 'Asia/Jakarta');

module.exports = CronJob;