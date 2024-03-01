const Booking = require('../models/Booking'); //Appointment
const Campground = require('../models/Campground'); //Hospital
//@desc Get all appointment
//@route GET/api/v1/appointment
//@access Public

exports.deleteAppointment = async (req,res,next) => {
    try{
        const appointment = await Booking.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,message:`No booking with the id of ${req.params.id}`});
        }

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this bootcamp`});
        }

        await appointment.deleteOne();

        res.status(200).json({
            success:true,
            data:{}
        });

    
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot delete Booking"
        })
    }
}

exports.updateAppointment = async (req,res,next) => {
    try{
        let appointment = await Booking.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
        }

        appointment = await Booking.findByIdAndUpdate(req.params.id,req.body,{
            new : true,
            runValidators:true
        });

        res.status(200).json({
            success:true,
            data: appointment
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update the Booking"});
    }
}
exports.addAppointment = async (req,res,next) => {
    try {
        req.body.hospital = req.params.hospitalId;
        const camp = await Campground.findById(req.params.hospitalId);
        if(!camp){
            return res.status(404).json({success:false,message:`No camp with the id of ${req.params.hospitalId}`});
        }

        //add user Id to req.body
        req.body.user = req.user.id;

        //Check for existed appointment
        const existedAppointments = await Appointment.find({user:req.user.id});

        //If the user is not admin , they can only create 3 appointment
        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 booking`});
        }

        const appointment = await Campground.create(req.body);
        res.status(200).json({
            success:true,
            data:appointment
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create this booking"});
    }
}

exports.getAppointment = async(req,res,next) => {
    try{
        const appointment = await Booking.findById(req.params.id).populate({
            path:'campground',
            select:'name desciption tel'
        });

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success:true,
            data : appointment
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot finds Booking"});
    }
}

exports.getAppointments = async (req,res,next) => {
    let query;

    if(req.user.role != 'admin'){ //General users can see only their appointment
        query = Booking.find({user:req.user.id}).populate({
            path:'campground',
            select:'name province tel'
        });
    }
    else{
        if(req.params.campgroundId){
            console.log(req.params.campgroundId);
            query = Appointment.find({hospital:req.params.campgroundId}).populate({
                path:"campground",
                select: "name province tel",
            });
        }
        else{
            query = Campground.find().populate({
                path:'campground',
                select: ' name province tel'
            });
        }
    
    }
    try{
        const bookings = await query; //appointments
        res.status(200).json({
            success:true,
            count:bookings.length,
            data: bookings
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find Booking"});
    }
};