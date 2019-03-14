const mongoose = require('mongoose');


let userSchema = mongoose.Schema({
    userId: String,
    userName: String,
    userPwd: String,
    historyList: [
        {
            'hid': String,
            'name': String,
            'forceVal': Number,
            'age': Number,
            'note': String
        }
    ],
})

module.exports = mongoose.model("User", userSchema);