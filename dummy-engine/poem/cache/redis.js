/**
 * Created by strawmanbobi
 * 2015-06-24.
 */

require('../configuration/constants');
var ErrorCode = require('../configuration/error_code');
var Enums = require('../configuration/enums');
var BaseCache = require('./base_cache.js');

var redis = require("redis");

var logger = require('../logging/logger4js').helper;

var errorCode = new ErrorCode();
var enums = new Enums();

var Cache = function(_host, _port, _user, _password) {
    this.redisClient = redis.createClient(_port, _host, {detect_buffers: true});
    // initialize client according to run-time ENV
    // in _user indicates the redis instance:token pair value
    if(null != _password) {
        logger.info("Redis needs authentication");
        this.redisClient.auth(_password, redis.print);
    }
    logger.info("Redis client connected");
};

Cache.prototype = Object.create(BaseCache.prototype);

Cache.prototype.set = function(key, value, ttl, callback) {
    this.redisClient.set(key, value, function(err) {
        if(err) {
            logger.error("Redis set value failed with key " + key);
            callback(errorCode.FAILED);
        } else {
            callback(errorCode.SUCCESS);
        }
    });
};

Cache.prototype.get = function(key, isBuffer, callback) {
    if(true == isBuffer) {
        this.redisClient.get(new Buffer(key), function (err, reply) {
            if(err) {
                logger.error("Redis get buffer failed with key " + key);
                this.redisClient.end();
                callback(errorCode.FAILED, null);
            } else {
                this.redisClient.end();
                callback(errorCode.SUCCESS, reply);
            }
        });
    } else {
        this.redisClient.get(key, function(err, reply) {
            if(err) {
                logger.error("Redis get value failed with key " + key);
                this.redisClient.end();
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, reply);
            }
        });
    }
};

Cache.prototype.delete = function(key, callback) {
    this.redisClient.del(key, function(err) {
        if(err) {
            logger.error("Redis del value failed with key " + key);
            this.redisClient.end();
            callback(errorCode.FAILED);
        } else {
            callback(errorCode.SUCCESS);
        }
    });
};

module.exports = Cache;