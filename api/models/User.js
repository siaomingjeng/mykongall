'use strict';

var _ = require('lodash');
var async = require('async');
var uuid = require('node-uuid');
var defUserSeedData = require('../../config/default-user-seed-data.js');

/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
    tableName: "konga_users",
    autoPK: false,
    attributes: {
        id: {
            type: 'integer',
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        username: {
            type: 'string',
            unique: true,
            required: true
        },
        email: {
            type: 'email',
            unique: true,
            required: true
        },
        firstName: {
            type: 'string'
        },
        lastName: {
            type: 'string'
        },
        admin: {
            type: 'boolean',
            defaultsTo: false
        },

        node_id: {
            type: 'string',
            defaultsTo: ''
        },

        active: {
            type: 'boolean',
            defaultsTo: false
        },

        activationToken : {
            type : 'string'
        },

        node: {
            model: 'kongnode'
        },

        // Passport configurations
        passports: {
            collection: 'Passport',
            via: 'user'
        },
    },

    afterDestroy: function (values, cb) {

        sails.log("User:afterDestroy:called => ",values);


        var fns = [];

        values.forEach(function(user){
            fns.push(function(callback){
                // Delete passports
                sails.models.passport.destroy({user : user.id})
                    .exec(callback)
            })
        })

        async.series(fns,cb);

    },

    //model validation messages definitions
    validationMessages: {
        email: {
            required: 'Email is required',
            email: 'The email address is not valid',
            unique: 'Email address is already taken'
        },
        username: {
            required: 'Username is required',
            unique: 'Username is already taken'
        }
    },

    //seedData object should now come from a file
    // the new object has had the password field added
    // we need to remove it
    seedData: defUserSeedData.seedData.map( function (orig) {
      return {
        "username": orig.username,
        "email": orig.email,
        "firstName": orig.firstName,
        "lastName": orig.lastName,
        "node_id": orig.node_id,
        "admin": orig.admin,
        "active" : orig.active
      }
    })
});

var mongoModel = function () {
    var obj = _.cloneDeep(defaultModel)
    delete obj.autoPK
    delete obj.attributes.id
    return obj;
}

module.exports = sails.config.models.connection == 'mongo' ? mongoModel() : defaultModel
