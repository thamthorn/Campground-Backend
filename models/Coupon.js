const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    name: {
        type:String,
        required : true
    },
    discount: {
        type:String,
        required : true
    },
    detail: {
        type: String
    },
    expiredDate: {
        type : Date,
        //30 days expired
        default : Date.now() + (30 * 24 * 60 * 60 * 1000)
    }
});

module.exports = mongoose.model('Coupon',CouponSchema);