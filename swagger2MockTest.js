'use strict';

const jsyaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
_.mixin(require("lodash-deep"));

const Mock = require('./mock');
const Validate = require('./validate');

var Count = {
    count: 0,
    max: 10,
    setZore: function () { this.count = 0; },
    setMax: function (max) { this.max = max; },
    isZore: function () { return this.count === 0 },
    addcount: function () { this.count++; },
    isMax: function () { return this.count > this.max },
}

/**
 * 根据路径读取swagger文档,生成mockJson
 * 
 * @param {String} iPath 文档路径
 * @param {Function} cb 读取完毕，回调函数
 */
function swagger2MockTest(iPath) {
    return new Promise((resolve) => {
        var files = getswaggersPath(iPath), jsons = {}, count = 0;
        files.forEach(async function (item) {
            var swaggerDoc = await readSwaggerFile(item);
            addDefinitionsMockTest(swaggerDoc.definitions);
            addPathsMockTest(swaggerDoc.paths, swaggerDoc.definitions);
            var mock = parseUrl(swaggerDoc);
            Object.assign(jsons, mock)
            if (++count === files.length) {
                //fs.writeFile('a.json', JSON.stringify(jsons, null, "\t"))
                resolve(jsons);
            }
        });
    })

}

/**
 * paths add mock test method
 * 
 * @param {object} paths 
 * @param {object} definitions 
 */
function addPathsMockTest(paths, definitions) {

    for (let i in paths) {
        for (let j in paths[i]) {
            let one = paths[i][j];
            one.parameters && buildParameters(one.parameters);
            one.responses && buildResponses(one.responses);
        }
    }

    function buildParameters(parameters) {
        parameters.mock = function () {
            Count.setZore();
            var data = {};
            for (var i = 0; i < parameters.length; i++) {
                var item = parameters[i];
                if (!item.required && Math.random() < 0.5) {
                    continue;
                }
                var iin = item.in, obj = {};
                if (!data[iin]) data[iin] = {};
                var ditem = data[iin];
                if (item.schema && (item.schema.$ref || item.schema.items.$ref)) {
                    var ref;
                    if (item.schema.items) {
                        ref = definitions[item.schema.items.$ref.split('#/definitions/')[1]];
                        ditem[item.name] = buildArryMock(ref.mock);
                    } else {
                        ref = definitions[item.schema.$ref.split('#/definitions/')[1]];
                        ditem[item.name] = ref.mock();
                    }
                } else {
                    if (item.schema) {
                        ditem[item.name] = buildArryMock(Mock[item.schema.items.type]);
                    } else {
                        ditem[item.name] = Mock[item.type]();
                    }

                }
            }


            return data;
        }
        parameters.test = function (value) {
            var msg = '';
            for (var i = 0; i < parameters.length; i++) {
                var item = parameters[0];
                if (item.required) {
                    var name = item.name, vitem;
                    switch (item.in) {
                        case 'path':
                            vitem = value.path[name];
                            if (!vitem) { msg += buildMsg(name, '请输入path'); }
                            else { msg += buildMsg(name, Validate[item.type](vitem)) }
                            break;
                        case 'query':
                            vitem = value.query[name];
                            if (!vitem) { msg += buildMsg(name, '请输入query'); }
                            else { msg += buildMsg(name, Validate[item.type](vitem)) }
                            break;

                        case 'body':
                            vitem = value.body
                            if (!vitem) { msg += buildMsg('body', '请输入body'); }
                            else {
                                var ref = definitions[item.schema.$ref.split('#/definitions/')[1]];
                                msg += ref.test(vitem);
                            }
                            break;
                    }
                }
            };
            return msg;
        }
    }

    function buildResponses(responses) {
        var item;
        for (var key in responses) {
            item = responses[key]
            if (item.schema) {
                (function (item) {
                    if (item.schema.type && !item.schema.items) {
                        item.mock = function () {
                            return Mock[item.schema.type]();
                        }
                        item.test = function (value) {
                            return Validate[item.schema.type](value);
                        }
                    } else {
                        item.mock = function () {
                            Count.setZore();
                            if (item.schema.items) {
                                var ref = definitions[item.schema.items.$ref.split('#/definitions/')[1]];
                                return buildArryMock(ref.mock);
                            } else {
                                var ref = definitions[item.schema.$ref.split('#/definitions/')[1]];
                                return ref.mock();
                            }
                        }
                        item.test = function (value) {
                            if (item.schema.items) {
                                var ref = definitions[item.schema.items.$ref.split('#/definitions/')[1]];
                                var msg = Validate.array(value);
                                if (!msg) {
                                    value && value.forEach(function (item) {
                                        msg += ref.test(item);
                                    })
                                }
                                return msg;
                            } else {
                                var ref = definitions[item.schema.$ref.split('#/definitions/')[1]];
                                return ref.test(value);
                            }

                        }
                    }
                }(item))
            }
        }
    }

}
/**
 * 给definitions添加mock方法
 * 
 * @param {object} swaggerDoc.definitions 
 */
function addDefinitionsMockTest(definitions) {
    for (var key in definitions) {
        let one = definitions[key];
        if (!one.mock)
            buildOne(one);
    }

    function buildOne(one) {
        switch (one.type) {
            case 'object':
                buildObject(one, one.properties);
                break;
            case 'array':
                console.log('等待补充:definitions.type=array');
                break;
        }
    }

    function buildObject(one, properties) {
        one.mock = function () {
            if (Count.isMax()) {
                return null;
            }
            Count.addcount();
            var item, mockfuc, mockdate = {};
            for (var key in properties) {
                item = properties[key]
                var mockfuc = item.mock
                if ((item.items && item.items.$ref) || item.$ref) {
                    var ref;
                    if (item.items) {
                        ref = definitions[item.items.$ref.split('#/definitions/')[1]];
                    } else {
                        ref = definitions[item.$ref.split('#/definitions/')[1]];
                    }
                    if (!ref.mock || !ref.test) {
                        buildOne(ref)
                    }
                    if (item.items) {
                        mockdate[key] = buildArryMock(ref.mock)
                    } else {
                        mockdate[key] = ref.mock();
                    }
                } else {
                    if (item.items) {
                        mockdate[key] = buildArryMock(Mock[item.type]);
                    } else {
                        mockdate[key] = Mock[item.type]();
                    }
                }
                if (!mockdate[key]) {
                    delete mockdate[key];
                }
            }
            return mockdate;
        };

        one.test = function (value) {
            //判断required
            var msg = '';
            if (one.required)
                for (let item of one.required) {
                    if (value && !~Object.keys(value).indexOf(item)) {
                        msg += buildMsg('required', item);
                    }
                }
            //已填写字段
            for (var key in value) {
                var item = properties[key];
                var vitem = value[key];
                if ((item.items && item.items.$ref) || item.$ref) {
                    var ref;
                    if (item.items) {
                        ref = definitions[item.items.$ref.split('#/definitions/')[1]];
                    } else {
                        ref = definitions[item.$ref.split('#/definitions/')[1]];
                    }
                    if (!ref.test) {
                        buildOne(ref)
                    }
                    if (item.items) {
                        var imsg = Validate.array(vitem);
                        if (imsg) {
                            msg += buildMsg(key, imsg);
                        } else {
                            vitem && vitem.forEach(function (itm) {
                                msg += ref.test(itm);
                            });
                        }
                    } else {
                        if (item.items) {
                            var imsg = Validate.array(vitem);
                            if (imsg) {
                                msg += buildMsg(key, imsg);
                            } else {
                                vitem && vitem.forEach(function (itm) {
                                    msg += ref.test(itm);
                                });
                            }
                        } else {
                            msg += ref.test(vitem);
                        }

                    }
                } else {
                    msg += buildMsg(key, Validate[item.type](vitem));
                }
            }
            return msg;
        };
    }
}

/** 
 * parse swagger url
 * @param {JSON} swaggerDoc swagger doc
 */
function parseUrl(swaggerDoc) {
    var data = {};
    for (var key in swaggerDoc.paths) {
        data[swaggerDoc.basePath + key] = swaggerDoc.paths[key];
    }
    return data
}

/** 
 * 获取swagger文件
 * @param {输入路径} iPath 
 */
function getswaggersPath(iPath, arry) {
    var arr;
    try {
        if (arry) {
            arr = arry;
        } else {
            arr = [];
        }
        var stats = fs.statSync(iPath)
        if (stats.isFile()) {
            return [iPath];
        } else {
            var files = fs.readdirSync(iPath);
            for (var item of files) {
                var mpath = path.join(iPath, item);
                stats = fs.statSync(mpath)
                if (stats.isFile()) {
                    if (path.extname(item) === '.yaml') {
                        arr.push(mpath)
                    }
                } else {
                    arr = getswaggersPath(mpath, arr);
                }
            }
            return arr;
        }
    } catch (error) {
        console.error('请输入正确路径,eg(window path D:\\\\My Documents\\\\swagger)');
        throw error;
    }
}

/**
 * 读取文件，转换为json输出
 * 
 * @param {string} path 文件路径
 */
function readSwaggerFile(path) {
    return new Promise((resolve) => {
        fs.readFile(path, 'utf8', function (err, file) {
            if (err) {
                throw err;
            } else {
                resolve(jsyaml.safeLoad(file));
            }
        });
    })
}

/**
 * 生成模拟数据数组
 * 
 * @param {Function} mockfuc 
 * @returns 
 */
function buildArryMock(mockfuc) {
    var data = [];
    for (var i = 0; i < Math.random() * 10; i++) {
        data.push(mockfuc());
    }
    return data;
}


function buildMsg(key, value) {
    if (value && key)
        return key + ':' + value + ';\n\r';
    return '';
}



module.exports = swagger2MockTest;