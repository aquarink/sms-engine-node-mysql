var fs = require('fs');
var mkdirp = require('mkdirp');
var CronJob = require('cron').CronJob;
var db = require('./mysql');

new CronJob('* * * * * *', function () {
    var folder = './files/dr/';
    var dateNow = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(':', '-').replace(':', '-');
    try {

        fs.readdir(folder, function (err, filenames) {
            if (!err) {
                try {
                    filenames.forEach(function (filename) {
                        fs.readFile(folder + filename, 'utf-8', function (err, content) {
                            if (!err) {
                                var stats = fs.statSync(folder + filename);
                                var fileSizeInBytes = stats.size;

                                if (fileSizeInBytes > 100) {
                                    try {
                                        var contentParse = JSON.parse(content);

                                        fs.unlink(folder + filename, function (err) {
                                            if (!err) {
                                                //Update Push Report
                                                db.query('UPDATE tb_sms_push SET send_status = ? WHERE trx_id = ?', [contentParse.stat, contentParse.trx_id], function (err, results) {
                                                    if (!err) {
                                                        // Insert To DR Log
                                                        db.query("INSERT INTO tb_dr SET ?", [contentParse], function (err, resInsert) {
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
                                } else {
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

                                        checkDirectory('./files/empty/dr', function (error) {
                                            if (error.code === 'ENOENT') {
                                                mkdirp('./files/empty/dr', function (err) {
                                                    if (!err)
                                                        fs.rename(folder + filename, './files/empty/dr/' + filename, function (err) {
                                                            if (!err) {
                                                                console.log('[' + dateNow + '] : Move Empty File DR-Read If Ok');
                                                            } else {
                                                                console.log(err);
                                                            }
                                                        });
                                                    else
                                                        console.log(err);
                                                });
                                            } else {
                                                fs.rename(folder + filename, './files/empty/dr/' + filename, function (err) {
                                                    if (!err) {
                                                        console.log('[' + dateNow + '] : Move Empty File DR-Read Else Ok');
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });
                                            }
                                        });
                                    } catch (err) {
                                        console.log('error try catch dr-read create empty folder');
                                    }
                                }
                            } else {
                                console.log(err);
                            }
                        });
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