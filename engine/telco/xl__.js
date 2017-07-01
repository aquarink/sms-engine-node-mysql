var jsonfile = require('jsonfile');
var fs = require('fs');
var mkdirp = require('mkdirp');
const async = require('async');
var reQuest = require('request');
var CronJob = require('cron').CronJob;
var db = require('../mysql');

var telcoName = 'xl';

new CronJob('* * * * * *', function () {
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

                    telcoConfig(telcoName, function (resTelConf) {

                        for (var i = 0; i < resTelConf.length; i++) {
                            if (filenames.length > resTelConf[i].push_limit) {
                                for (var offset = 0; offset < resTelConf[i].push_limit; ) {
                                    async.map(filenames, (smsData, callback) => {
                                        fs.readFile(folder + '/' + smsData, 'utf-8', function (err, content) {
                                            if (!err) {
                                                var contentParse = JSON.parse(content);
                                                for (var j = 0; j < resTelConf.length; j++) {
                                                    var link = resTelConf[j].address + '?username=' + resTelConf[j].username + '&password=' + resTelConf[j].password + '&msisdn=' + contentParse.msisdn + '&trxid=' + contentParse.trx_id + '&serviceId=' + contentParse.cost + '&sms=' + contentParse.sms_field + '&shortname=1212121212';
                                                    // UNLINK FILE
                                                    unlinkFile(folder + '/' + smsData, function (resDel) {
                                                        if (resDel === 'deleteOk') {
                                                            console.log('[' + dateNow + '] : Remove File on Telco ' + telcoName + ' More Limit Ok');
                                                            reQuest(link, (requestErr, response, body) => {
                                                                if (!requestErr) {
                                                                    if (response.statusCode === 200) {
                                                                        const newData = {
                                                                            body,
                                                                            filename: folder + '/' + smsData,
                                                                            data: contentParse
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
                                                    });
                                                }
                                            } else {
                                                callback(err);
                                            }
                                        });

                                    }, (CbNotNull, CbNull) => {
                                        if (CbNotNull) {
                                            //Body = CbNotNull.body
                                            //File Name = CbNotNull.filename
                                            //File Data = CbNotNull.data

                                            var dataStringfy = JSON.stringify(CbNotNull.data);
                                            var dataParse = JSON.parse(dataStringfy);

                                            if (dataParse.trx_id === '') {
                                                CbNotNull.data.trx_id = CbNotNull.body;
                                                insertPush(CbNotNull.data, function (resInsert) {
                                                    if (resInsert === 'insertOk') {
                                                        console.log('[' + dateNow + '] : Insert Push Data on Telco ' + telcoName + ' New TrxID More Limit Ok');
                                                    }
                                                });
                                            } else {
                                                insertPush(CbNotNull.data, function (resInsert) {
                                                    if (resInsert === 'insertOk') {
                                                        console.log('[' + dateNow + '] : Insert Push Data on Telco ' + telcoName + ' More Limit Ok');
                                                    }
                                                });
                                            }
                                        }
                                    });

                                    offset += 1;
                                }
                            } else {
                                async.map(filenames, (smsData, callback) => {
                                    fs.readFile(folder + '/' + smsData, 'utf-8', function (err, content) {
                                        if (!err) {
                                            var contentParse = JSON.parse(content);
                                            for (var j = 0; j < resTelConf.length; j++) {

                                                var link = resTelConf[j].address + '?username=' + resTelConf[j].username + '&password=' + resTelConf[j].password + '&msisdn=' + contentParse.msisdn + '&trxid=' + contentParse.trx_id + '&serviceId=' + contentParse.cost + '&sms=' + contentParse.sms_field + '&shortname=1212121212';

                                                reQuest(link, (requestErr, response, body) => {
                                                    if (!requestErr) {
                                                        if (response.statusCode === 200) {
                                                            const newData = {
                                                                body,
                                                                filename: folder + '/' + smsData,
                                                                data: contentParse
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
                                        } else {
                                            callback(err);
                                        }
                                    });

                                }, (CbNotNull, CbNull) => {
                                    if (CbNotNull) {
                                        //Body = CbNotNull.body
                                        //File Name = CbNotNull.filename
                                        //File Data = CbNotNull.data

                                        unlinkFile(CbNotNull.filename, function (resDel) {
                                            if (resDel === 'deleteOk') {
                                                console.log('[' + dateNow + '] : Remove File on Telco ' + telcoName + ' Less Limit Ok');
                                            } else {
                                                console.log(resDel);
                                            }
                                        });

                                        var dataStringfy = JSON.stringify(CbNotNull.data);
                                        var dataParse = JSON.parse(dataStringfy);

                                        if (dataParse.trx_id === '') {
                                            CbNotNull.data.trx_id = CbNotNull.body;
                                            insertPush(CbNotNull.data, function (resInsert) {
                                                if (resInsert === 'insertOk') {
                                                    console.log('[' + dateNow + '] : Insert Push Data on Telco ' + telcoName + ' New TrxID Less Limit Ok');
                                                }
                                            });
                                        }
                                        if (dataParse.trx_id !== '') {
                                            insertPush(CbNotNull.data, function (resInsert) {
                                                if (resInsert === 'insertOk') {
                                                    console.log('[' + dateNow + '] : Insert Push Data on Telco ' + telcoName + ' Less Limit Ok');
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                } catch (err) {
                    console.log('error try catch on ' + telcoName);
                }
            } else {
                //console.log(err);
            }
        });
    } catch (err) {
        console.log('error try catch mo-read dir');
    }
}, null, true, 'Asia/Jakarta');

module.exports = CronJob;