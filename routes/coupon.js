const express = require('express');
const {getCoupons,getCoupon,createCoupon,updateCoupon,deleteCoupon} = require('../controllers/coupon');

// const router = express.Router({mergeParams:true});
const router = express.Router();

const {protect,authorize} = require('../middleware/auth');

router.route('/')
    .get(protect,authorize('vip','admin'),getCoupons)
    .post(protect,authorize('admin'),createCoupon);





router.route('/:id')
    .get(protect,authorize('vip','admin'),getCoupon)
    .put(protect,authorize('admin'),updateCoupon)
    .delete(protect,authorize('admin'),deleteCoupon);

module.exports = router