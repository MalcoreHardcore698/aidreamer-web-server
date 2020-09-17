
const AwardSchema = require('./../schemas/AwardSchema')
const mongoose = require('mongoose')
const { Schema } = mongoose

const ActTaskSchema = new Schema({
    title: { type: String, required: true },
    icon: { type: Schema.Types.ObjectId, ref: 'Icon', required: true },
    condition: [{ type: Schema.Types.ObjectId, ref: 'ConditionBlock', required: true }],
    awards: [{ type: AwardSchema, required: true }]
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('ActTask', ActTaskSchema)