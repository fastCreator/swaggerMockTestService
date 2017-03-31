const Mock = require('mockjs');
const fs =require('fs');
const MIN_INTEGER = Math.pow(-2, 31)
const MAX_INTEGER = Math.pow(2, 31) - 1
const MIN_LONG = Math.pow(-2, 63)
const MAX_LONG = Math.pow(2, 63) - 1
const MIN_FLOAT = Math.pow(2, -149)
const MAX_FLOAT = Math.pow(2, 128) - 1
const MIN_DOUBLE = Math.pow(-2, -1074)
const MAX_DOUBLE = Math.pow(2, 1024) - 1
const BASE64_EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

module.exports = {
    MIN_INTEGER: MIN_INTEGER,
    MAX_INTEGER: MAX_INTEGER,
    MIN_LONG: MIN_LONG,
    MAX_LONG: MAX_LONG,
    MIN_FLOAT: MIN_FLOAT,
    MAX_FLOAT: MAX_FLOAT,
    MIN_DOUBLE: MIN_DOUBLE,
    MAX_DOUBLE: MAX_DOUBLE,
    BASE64_EncodeChars: BASE64_EncodeChars,
    integer: mockinteger,
    long: mockLong,
    float: mockFloat,
    double: mockDouble,
    string: mockString,
    byte: mockByte,
    binary: mockBinary,
    boolean: mockBoolean,
    date: mockDate,
    time: mockTime,
    dateTime: mockDateTime,
    array: mockArray,
    file: mockFile,
    object:mockObject
}

function mockinteger() {
    return Mock.mock('@integer(' + MIN_INTEGER + ',' + MAX_INTEGER + ')')
}

function mockLong() {
    return Mock.mock('@integer(' + MIN_LONG + ',' + MAX_LONG + ')')
}

function mockFloat() {
    return Mock.mock('@float(' + MIN_FLOAT + ',' + MAX_FLOAT + ')')
}

function mockDouble() {
    return Mock.mock('@float(' + MIN_DOUBLE + ',' + MAX_DOUBLE + ')')
}

function mockString() {
    return Mock.mock('@string("lower",5,10)')
}

function mockByte() {
    return "base64,YWFhYWFhYQ==";
}

function mockBinary() {
    return new Blob(['hello world']);
}

function mockBoolean() {
    return Mock.mock('@boolean');
}

function mockDate() {
    return Mock.mock({ 'regexp': /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-2]|3[0-1])$/ }).regexp
}

function mockTime() {
    return Mock.mock({ 'regexp': /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)((.\d+)?Z|(+|-)\d{2}:\d{2})?$/ }).regexp
}

function mockDateTime() {
    return mockDate() + 'T' + mockTime();
}

function mockArray(item) {
    return Mock.mock({ "array|1-10": [item || mockString()] }).array
}

function mockFile() {
    return fs.createReadStream('./static/mock.jpg');
} 

function mockObject(){
    return {};
}