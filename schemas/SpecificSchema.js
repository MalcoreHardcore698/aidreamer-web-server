const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const AwardSchema = new Schema({
    area: {
        type: String,
        enum: [
            C.USER,
            C.ARTICLE,
            C.HUB,
            C.OFFER,
            C.CHAT,
            C.TOUR,
            C.PROFILE
        ],
        required: true
    },
    object: { type: Schema.Types.ObjectId },
})

module.exports = AwardSchema