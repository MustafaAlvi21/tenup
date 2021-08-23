const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User = new Schema({
    address: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', User);