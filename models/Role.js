const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const RoleSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{
        type: String,
        enum: [
            C.ACCESS_CLIENT,
            C.ACCESS_DASHBOARD,
            C.ADD_USER,
            C.ADD_ARTICLE,
            C.ADD_OFFER,
            C.ADD_HUB,
            C.EDIT_USER,
            C.EDIT_ARTICLE,
            C.EDIT_OFFER,
            C.EDIT_HUB,
            C.DELETE_USER,
            C.DELETE_ARTICLE,
            C.DELETE_OFFER,
            C.DELETE_HUB,
            C.OPEN_CHAT,
            C.CLOSE_CHAT,
            C.USER_MESSAGING,
            C.SYSTEM_MESSAGING
        ]
    }]
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Role', RoleSchema)