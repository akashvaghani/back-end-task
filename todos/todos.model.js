var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var TodoSchema = new Schema({
 name: String,
 address: String,
 city: String,
 country: String,
 userId: { type: Schema.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

module.exports = mongoose.model("Todo", TodoSchema);
