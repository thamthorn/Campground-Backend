const express = require('express');
const {getCampgrounds,getCampground,createCampground,updateCampground,deleteCampground,getVacCenters} = require('../controllers/campgrounds');

//Include other resource routers
const appointmentRouter = require('./appointments');

const router = express.Router();

const {protect,authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:campgroundId/appointments/',appointmentRouter);

router.route('/vacCenters').get(getVacCenters);
router.route('/').get(getCampgrounds).post(protect,authorize('admin') , createCampground);
router.route('/:id').get(getCampground).put(protect,authorize('admin'),updateCampground).delete(protect,authorize('admin'),deleteCampground);




module.exports = router;

