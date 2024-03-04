const Booking = require('../models/Booking'); 
const Campground = require('../models/Campground'); 


exports.deleteBooking = async (req,res,next) => {
    try{
        const booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success:false,message:`No booking with the id of ${req.params.id}`});
        }

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this bootcamp`});
        }

        await booking.deleteOne();

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

exports.updateBooking = async (req,res,next) => {
    try{
        let booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success:false,message:`No booking with the id of ${req.params.id}`});
        }

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this booking`});
        }

        booking = await Booking.findByIdAndUpdate(req.params.id,req.body,{
            new : true,
            runValidators:true
        });

        res.status(200).json({
            success:true,
            data: booking
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update the Booking"});
    }
}
exports.addBooking = async (req,res,next) => {
    try {
        req.body.campground = req.params.campgroundId;
        const campground = await Campground.findById(req.params.campgroundId);
        if(!campground){
            return res.status(404).json({success:false,message:`No camp with the id of ${req.params.campgroundId}`});
        }

        //add user Id to req.body
        req.body.user = req.user.id;

        //Check for existed booking
        const existedBookings = await Booking.find({user:req.user.id});

        //If the user is not admin , they can only create 3 booking
        if(existedBookings.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 booking`});
        }

        const booking = await Booking.create(req.body);
        res.status(200).json({
            success:true,
            data:booking
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create this booking"});
    }
}

exports.getBooking = async(req,res,next) => {
    try{
        const booking = await Booking.findById(req.params.id).populate({
            path:'campground',
            select:'name desciption tel'
        });

        if(!booking){
            return res.status(404).json({success:false,message:`No booking with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success:true,
            data : booking
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot finds Booking"});
    }
}

exports.getBookings = async (req,res,next) => {
    let query;

    if(req.user.role != 'admin'){ //General users can see only their booking
        query = Booking.find({user:req.user.id}).populate({
            path:'campground',
            select:'name address tel'
        });
    }
    else{
        if(req.params.campgroundId){
            console.log(req.params.campgroundId);
            query = Booking.find({hospital:req.params.campgroundId}).populate({
                path:"campground",
                select: "name address tel",
            }).populate({
                path:"user",
                select: "name"
                })
        }
        else{
            query = Booking.find().populate({
                path:'campground',
                select: 'name address tel'
            }).populate({
                path:"user",
                select: "name"
             });
        }
    
    }
    try{
        const bookings = await query; 
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