const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockSchema = new Schema(
    {
        stock_name  :   {type: String, required: true},
        price       :   {type: Number, required: true},
        likes       :   {type: Number, default: 0,  required: true},
        ip          :   {type: [String], default: [], required: true} 
    },
    { versionKey: false }
);

const stock_db = mongoose.model('Stock', stockSchema);

module.exports = stock_db;