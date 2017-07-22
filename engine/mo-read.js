var fs = require('fs');
<<<<<<< HEAD
var mkdirp = require('mkdirp');
=======
>>>>>>> 71e5d820a493c980174b013e4c77656d497db056
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

                        var theFile = folder + filename;

                        var sessionID = nameData[9].split(".")[0];

                        try {
                            db.query('SELECT * FROM tb_keyword WHERE keyword = ?', [nameData[4]], function (err, results) {
                                if (!err) {
                                    if (results.length > 0) {
                                        for (var i = 0; i < results.length; i++) {
                                            try {
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

                                                //Insert to Mo Temporary
                                                db.query('INSERT INTO tb_mo_temp (telco,shortcode,msisdn,sms_field,keyword,trx_id,trx_date,session_id,session_date,reg_type) VALUES(?,?,?,?,?,?,?,?,?,?)',
                                                        [nameData[0], nameData[1], nameData[2], nameData[3], nameData[4], nameData[5], nameData[6], sessionID, nameData[7], nameData[8]], function (err, resInsert) {
                                                    if (!err) {
                                                        //Insert to Mo Log
                                                        db.query('INSERT INTO tb_mo_log (telco,shortcode,msisdn,sms_field,keyword,trx_id,trx_date,session_id,session_date,reg_type) VALUES(?,?,?,?,?,?,?,?,?,?)',
                                                                [nameData[0], nameData[1], nameData[2], nameData[3], nameData[4], nameData[5], nameData[6], sessionID, nameData[7], nameData[8]], function (err, resInsert) {
                                                            if (!err) {
                                                                fs.unlink(theFile, function (err) {
                                                                    if (!err) {
<<<<<<< HEAD
                                                                        console.log('[' + dateNow + '] : Move File MO & Insert MO Log Else Ok');
                                                                    } else {
                                                                        console.log(err);
=======
                                                                        console.log('[' + dateNow + '] : Insert MO Temp, MO Log & Unlink File Ok');
>>>>>>> 71e5d820a493c980174b013e4c77656d497db056
                                                                    }
                                                                });

                                                            } else {
                                                                console.log(err);
                                                            }
                                                        });
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });

                                            } catch (err) {
                                                console.log('error try catch mo-read 82');
                                            }
                                        }
                                    } else {
                                        // Wrong Keyword
                                        try {
                                            //Insert to Mo Temporary
                                            db.query('INSERT INTO tb_mo_temp (telco,shortcode,msisdn,sms_field,keyword,trx_id,trx_date,session_id,session_date,reg_type) VALUES(?,?,?,?,?,?,?,?,?,?)',
                                                    [nameData[0], nameData[1], nameData[2], nameData[3], 'wrong', nameData[5], nameData[6], sessionID, nameData[7], nameData[8]], function (err, resInsert) {
                                                if (!err) {
                                                    //Insert to Mo Log
                                                    db.query('INSERT INTO tb_mo_log (telco,shortcode,msisdn,sms_field,keyword,trx_id,trx_date,session_id,session_date,reg_type) VALUES(?,?,?,?,?,?,?,?,?,?)',
                                                            [nameData[0], nameData[1], nameData[2], nameData[3], nameData[4], nameData[5], nameData[6], sessionID, nameData[7], nameData[8]], function (err, resInsert) {
                                                        if (!err) {
                                                            console.log('[' + dateNow + '] : Insert MO Temp & MO Log Wrong Ok');
                                                        } else {
                                                            console.log(err);
                                                        }
                                                    });
                                                } else {
                                                    console.log(err);
                                                }
                                            });
                                        } catch (err) {
                                            console.log('error try catch mo-read create Wrong Keyword 106');
                                        }
                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        } catch (err) {
                            console.log('error try catch mo-read query 114');
                        }
                    });
                } catch (err) {
                    console.log('error try catch mo-read foreach file 118');
                }
            }
        });
    } catch (err) {
        console.log('error try catch mo-read dir 123');
    }
}, null, true, 'Asia/Jakarta');

module.exports = CronJob;