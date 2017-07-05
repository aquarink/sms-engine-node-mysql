var jsonfile = require('jsonfile');
var fs = require('fs');
var mkdirp = require('mkdirp');
const async = require('async');
var reQuest = require('request');
var CronJob = require('cron').CronJob;
var db = require('../mysql');

var telcoName = 'xl';

new CronJob('*/2 * * * * *', function () {
    var folder = './files/push/' + telcoName;
    var dateNow = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(':', '-').replace(':', '-');
    try {

        fs.readdir(folder, function (err, filenames) {
            if (!err) {
                try {
                    function telcoConfig(telName, callback) {
                        db.query('SELECT * FROM tb_telco_config WHERE telco_name = ?', [telName], function (err, telCnfg) {
                            if (!err) {
                                callback(telCnfg);
                            }
                        });
                    }

                    function unlinkFile(theFile, callback) {
                        fs.unlink(theFile, function (err) {
                            if (!err) {
                                callback('deleteOk');
                            } else {
                                callback(err);
                            }
                        });
                    }

                    function insertPush(obj, callback) {
                        db.query('INSERT INTO tb_sms_push SET ?', [obj], function (err, resInsert) {
                            if (!err) {
                                callback('insertOk');
                            } else {
                                callback(err);
                            }
                        });
                    }

                    function hitTelco(url, callback) {
                        reQuest(url, (requestErr, response, body) => {
                            if (!requestErr) {
                                if (response.statusCode === 200) {
                                    const newData = {
                                        body
                                    };
                                    callback(newData);
                                } else {
                                    callback('not 200');
                                }
                            } else {
                                callback(requestErr);
                            }
                        });
                    }

                    telcoConfig(telcoName, function (resTelConf) {

                        if (filenames.length > resTelConf[0].push_limit) {
                            for (var offset = 0; offset < resTelConf[0].push_limit; ) {
                                var f = [];
                                f.push(filenames[offset]);
                                async.map(f, function (data, cb) {
                                    fs.readFile(folder + '/' + data, 'utf-8', function (err, content) {
                                        if (!err) {
                                            var stats = fs.statSync(folder + '/' + data);
                                            var fileSizeInBytes = stats.size;

                                            if (fileSizeInBytes > 100) {
                                                try {
                                                    var contentParse = JSON.parse(content);
                                                    var link = resTelConf[0].address + '?username=' + resTelConf[0].username + '&password=' + resTelConf[0].password + '&msisdn=' + contentParse.msisdn + '&trxid=' + contentParse.trx_id + '&serviceId=' + contentParse.cost + '&sms=' + contentParse.content_field + '&shortname=1212121212';
                                                    
                                                    unlinkFile(folder + '/' + data, function (resDel) {
                                                        if (resDel === 'deleteOk') {
                                                            hitTelco(link, function (resHit) {
                                                                if (resHit.body !== 'ok') {
                                                                    contentParse.trx_id = resHit.body;
                                                                } else {
                                                                    console.log('aaaaa');
                                                                }

                                                                insertPush(contentParse, function (resInsert) {
                                                                    cb(null, 'done');
                                                                });
                                                            });
                                                        } else {
                                                            console.log('more error');
                                                        }
                                                    });
                                                } catch (err) {
                                                    console.log('error try catch Telco ' + telcoName + ' file size');
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

                                                    checkDirectory('./files/empty/push/' + telcoName, function (error) {
                                                        if (error.code === 'ENOENT') {
                                                            mkdirp('./files/empty/push/' + telcoName, function (err) {
                                                                if (!err)
                                                                    fs.rename(folder + '/' + data, './files/empty/push/' + telcoName + '/' + data, function (err) {
                                                                        if (!err) {
                                                                            console.log('[' + dateNow + '] : Move Empty File Telco ' + telcoName + ' If Ok');
                                                                        } else {
                                                                            console.log(err);
                                                                        }
                                                                    });
                                                                else
                                                                    console.log(err);
                                                            });
                                                        } else {
                                                            fs.rename(folder + '/' + data, './files/empty/push/' + telcoName + '/' + data, function (err) {
                                                                if (!err) {
                                                                    console.log('[' + dateNow + '] : Move Empty File Telco ' + telcoName + ' Else Ok');
                                                                } else {
                                                                    console.log(err);
                                                                }
                                                            });
                                                        }
                                                    });
                                                } catch (err) {
                                                    console.log('error try catch telco ' + telcoName + ' create empty folder');
                                                }
                                            }
                                        } 
//                                        else {
//                                            console.log(err);
//                                        }
                                    });
                                }, (one, two) => {
                                    if (two[0] === 'done') {
                                        console.log('[' + dateNow + '] : Unlink, Push & Insert Data on Telco ' + telcoName + ' More Limit Ok');
                                    }
                                });

                                offset += 1;
                            }
                        } else {
                            if (filenames.length > 0) {
                                for (var offset = 0; offset < filenames.length; offset++) {
                                    var f = [];
                                    f.push(filenames[offset]);
                                    async.map(f, function (data, cb) {
                                        fs.readFile(folder + '/' + data, 'utf-8', function (err, content) {
                                            if (!err) {
                                                var contentParse = JSON.parse(content);
                                                var link = resTelConf[0].address + '?username=' + resTelConf[0].username + '&password=' + resTelConf[0].password + '&msisdn=' + contentParse.msisdn + '&trxid=' + contentParse.trx_id + '&serviceId=' + contentParse.cost + '&sms=' + contentParse.content_field + '&shortname=1212121212';

                                                unlinkFile(folder + '/' + data, function (resDel) {
                                                    if (resDel === 'deleteOk') {
                                                        hitTelco(link, function (resHit) {
                                                            if (resHit.body !== 'ok') {
                                                                contentParse.trx_id = resHit.body;
                                                            } else {
                                                                contentParse;
                                                            }

                                                            insertPush(contentParse, function (resInsert) {
                                                                cb(null, 'done');
                                                            });
                                                        });
                                                    } else {
                                                        console.log('less error');
                                                    }
                                                });
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                    }, (one, two) => {
                                        if (two[0] === 'done') {
                                            console.log('[' + dateNow + '] : Unlink, Push & Insert Data on Telco ' + telcoName + ' Less Limit Ok');
                                        }
                                    });
                                }
                            }
                        }

                    });
                } catch (err) {
                    console.log('error try catch on ' + telcoName);
                }
            } 
//            else {
//                console.log(err);
//            }
        });
    } catch (err) {
        console.log('error try catch mo-read dir');
    }
}, null, true, 'Asia/Jakarta');

module.exports = CronJob;