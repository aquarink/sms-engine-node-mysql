var fs = require('fs');
var moment = require('moment-timezone');
var CronJob = require('cron').CronJob;
var db = require('./mysql');

new CronJob('* * * * * *', function () {
    var folder = './files/dr/';
    var dateNow = moment().tz("Asia/Jakarta").format("YYYY-MM-DD-HH-mm-ss");
    try {

        fs.readdir(folder, function (err, filenames) {
            if (!err) {
                try {
                    filenames.forEach(function (filename) {
                        try {
                            var nameData = filename.split("@");
                            // 0 = telco
                            // 1 = shortcode
                            // 2 = msisdn
                            // 3 = trxId
                            // 4 = trxDate
                            // 5 = stat
                            // 6 = sessionDate
                            // 7 = sessionID
                            
                            var sessionID = nameData[7].split(".")[0];

                            fs.unlink(folder + filename, function (err) {
                                if (!err) {
                                    //Update Push Report
                                    db.query('UPDATE tb_sms_push SET send_status = ? WHERE trx_id = ?', [nameData[5], nameData[3]], function (err, results) {
                                        if (!err) {
                                            // Insert To DR Log
                                            db.query("INSERT INTO tb_dr (telco,shortcode,msisdn,trx_id,trx_date,session_id,session_date,stat) VALUES(?,?,?,?,?,?,?,?)",
                                                    [nameData[0], nameData[1], nameData[2], nameData[3], nameData[4], sessionID, nameData[6],nameData[6]], function (err, resInsert) {
                                                if (!err) {
                                                    console.log('[' + dateNow + '] : Delete DR File, Update Push & Insert DR Data Ok');
                                                } else {
                                                    console.log(err);
                                                }
                                            });
                                        } else {
                                            console.log(err);
                                        }
                                    });
                                }
                            });

                        } catch (err) {
                            console.log('error try catch dr-read query');
                        }

                    });
                } catch (err) {
                    console.log('error try catch dr-read foreach file');
                }
            } else {
                //console.log(err);
            }
        });
    } catch (err) {
        console.log('error try catch dr-read dir');
    }
}, null, true, 'Asia/Jakarta');

module.exports = CronJob;