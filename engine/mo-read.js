var fs = require('fs');
var mkdirp = require('mkdirp');
var CronJob = require('cron').CronJob;
var db = require('./mysql');

new CronJob('* * * * * *', function () {
    var folder = './files/mo/';
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
                                        db.query('SELECT * FROM tb_keyword WHERE keyword = ?', [contentParse.keyword], function (err, results) {
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

                                                            db.query('SELECT * FROM tb_members WHERE telco = ? AND msisdn = ? AND shortcode = ? AND app = ?', [contentParse.telco, contentParse.msisdn,contentParse.shortcode, contentParse.keyword], function (err, checkData) {
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
                                                                        db.query('INSERT INTO tb_members (telco,shortcode,msisdn,app,join_date,reg_types) VALUES(?,?,?,?,?,?)', [contentParse.telco, contentParse.shortcode, contentParse.msisdn, contentParse.keyword, dateNow, contentParse.reg_type], function (err, resInsertMember) {
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
                                                            checkDirectory('./files/app/' + contentParse.keyword, function (error) {
                                                                if (error.code === 'ENOENT') {
                                                                    mkdirp('./files/app/' + contentParse.keyword, function (err) {
                                                                        if (!err)
                                                                            fs.rename(folder + filename, './files/app/' + contentParse.keyword + '/' + filename, function (err) {
                                                                                if (!err) {
                                                                                    db.query('INSERT INTO tb_mo SET ?', [contentParse], function (err, resInsert) {
                                                                                        if (!err) {
                                                                                            console.log('[' + dateNow + '] : Make Dir, Move File MO & Insert MO Log If Ok');
                                                                                        } else {
                                                                                            console.log(err);
                                                                                        }
                                                                                    });
                                                                                } else {
                                                                                    console.log(err);
                                                                                }
                                                                            });
                                                                        else
                                                                            console.log(err);
                                                                    });
                                                                } else {
                                                                    fs.rename(folder + filename, './files/app/' + contentParse.keyword + '/' + filename, function (err) {
                                                                        if (!err) {
                                                                            db.query('INSERT INTO tb_mo SET ?', [contentParse], function (err, resInsert) {
                                                                                if (!err) {
                                                                                    console.log('[' + dateNow + '] : Move File MO & Insert MO Log Else Ok');
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
                                                                                db.query('INSERT INTO tb_mo SET ?', [contentParse], function (err, resInsert) {
                                                                                    if (!err) {
                                                                                        console.log('[' + dateNow + '] : Make Dir, Move File MO to Wrong Keyword & Insert MO Log If Ok');
                                                                                    } else {
                                                                                        console.log(err);
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                console.log(err);
                                                                            }
                                                                        });
                                                                    else
                                                                        console.log(err);
                                                                });
                                                            } else {
                                                                fs.rename(folder + filename, './files/app/others/' + filename, function (err) {
                                                                    if (!err) {
                                                                        // Insert To MO Log
                                                                        db.query('INSERT INTO tb_mo SET ?', [contentParse], function (err, resInsert) {
                                                                            if (!err) {
                                                                                console.log('[' + dateNow + '] : Move File MO to Wrong Keyword & Insert MO Log Else Ok');
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

                                        checkDirectory('./files/empty/mo', function (error) {
                                            if (error.code === 'ENOENT') {
                                                mkdirp('./files/empty/mo', function (err) {
                                                    if (!err)
                                                        fs.rename(folder + filename, './files/empty/mo/' + filename, function (err) {
                                                            if (!err) {
                                                                console.log('[' + dateNow + '] : Move Empty File MO-Read If Ok');
                                                            } else {
                                                                console.log(err);
                                                            }
                                                        });
                                                    else
                                                        console.log(err);
                                                });
                                            } else {
                                                fs.rename(folder + filename, './files/empty/mo/' + filename, function (err) {
                                                    if (!err) {
                                                        console.log('[' + dateNow + '] : Move Empty File MO-Read Else Ok');
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });
                                            }
                                        });
                                    } catch (err) {
                                        console.log('error try catch mo-read create empty folder');
                                    }
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