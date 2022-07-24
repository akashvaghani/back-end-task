var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs')

var UserSchema = new Schema({
 firstName: String,
 lastName: String,
 email: String,
 password: String,
 gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' }
}, {
    timestamps: true
});

UserSchema.pre('save', function (next) {
    var user = this

    // hash the password only if the password has been
    // changed or user is new

    if (!user.isModified('password')) return next()

    // generate the hash
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err)

        // change the password to the hashed version
        user.password = hash
        next()
    })
})

module.exports = mongoose.model("User", UserSchema);
