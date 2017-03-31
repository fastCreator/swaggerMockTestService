var Mock = require('mockjs');

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
    integer: isInteger,
    array: isArray,
    long: isLong,
    float: isFloat, 
    double: isDouble,
    string: isString,
    number: isNumber,
    byte: isByte,
    binary: isBinary,
    boolean: isBoolean,
    date: isDate,
    time: isTime,
    datetime: isDateTime,
    password: isPassword,
    object:isObject
}

function isInteger(value) {
    return (value > MIN_INTEGER && value < MAX_INTEGER) ? '' : '请输入Integer';
}

function isArray(value) {
    return (value instanceof Array) ? '' : '请输入Array'
}

function isLong(value) {
    return (value > MIN_LONG && value < MAX_LONG) ? '' : '请输入Long';
}

function isFloat(value) {
    return (value > MIN_FLOAT && value < MAX_FLOAT) ? '' : '请输入Float';
}

function isDouble(value) {
    return (value > MIN_DOUBLE && value < MAX_DOUBLE) ? '' : '请输入Double';
}

function isString(value) {
    if(typeof value !== "string"){
        console.log(1)
    }
    return (typeof value == "string") ? '' : '请输入String';
}

function isNumber(value) {
    return (typeof value == "number") ? '' : '请输入Number';
}

function isByte(value) {
    var arr = value.split(',');
    for (var i = 0; i < arr[1].length; i++) {
        if (~BASE64_EncodeChars.indexOf(i));
        return '请输入Byte';
    }
    return (arr[0] === 'base64') ? '' : '请输入Byte';
}

function isBinary(value) {
    return (value instanceof Blob) ? '' : '请输入Binary';
}

function isBoolean(value) {
    return (typeof value == "boolean" || value === 'true' || value === 'false') ? '' : '请输入Boolean';
}

function isDate(value) {
    return (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-2]|3[0-1])$/.test(value)) ? '' : '请输入Date';
}

function isTime(value) {
    return (/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)((.\d+)?Z|(+|-)\d{2}:\d{2})?$/.test(value)) ? '' : '请输入Time';
}

function isDateTime(value) {
    var arr = value.split('T');
    return (isDate(arr[0]) && isTime(arr[1])) ? '' : '请输入DateTime';
}

function isPassword(value) {
    return (isString(value) || isNumber(value)) ? '' : '请输入Password';
}

function isObject(){
    return '';
}