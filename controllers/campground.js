const Campground = require('../models/Campground');






exports.getCampgrounds = async (req,res,next) => {
    try{
    
        let query;
        //Copy req.query
        const reqQuery = {...req.query};

        //Fields to exclude
        const removeFields = ['select','sort','page','limit'];

        //Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param=>delete reqQuery[param]);
        console.log(reqQuery);

        //Create query string
        let queryStr = JSON.stringify(reqQuery);

        //Create operators($gt , $gte , etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);//

        //finding resource
        query = Campground.find(JSON.parse(queryStr)).populate('bookings');


        //Select fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        //sort
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else{
            query = query.sort({ rating: -1 });
        }
        //pagination
        const page = parseInt(req.query.page,10) || 1;
        const limit = parseInt(req.query.limit,10) || 25;
        const startIndex = (page-1)*limit;
        const endIndex = page*limit;
        const total = await Campground.countDocuments();

        query = query.skip(startIndex).limit(limit);

        //Executing query
        const campgrounds = await query;
        //Pagination result
        const pagination = {};

        if(endIndex < total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev={
                page:page-1,
                limit
            }
        }
        res.status(200).json({success:true,count:campgrounds.length,pagination, data:campgrounds});
    }
    catch(err){
        res.status(400).json({success:false});
    }

};


exports.getCampground = async (req,res,next) => {
    try{
        const campground = await Campground.findById(req.params.id);

        if(!campground)
            return res.status(400).json({success : false});
        

        res.status(200).json({success : true , data:campground});
    }
    catch(err){
        res.status(400).json({success:false});
    }
    

};

exports.createCampground = async (req,res,next) => {
    try{
        const campground = await Campground.create(req.body);
        res.status(201).json({
            success: true,
            data : campground
        });
    }
    catch(err){
        res.status(400).json({success:false,message:err.message});
        console.log(err.stack);
    }

};


exports.updateCampground = async (req,res,next) => {
    try{
        const campground = await Campground.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators:true
        });

        if(!campground){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true , data : campground});
    }
    catch(err){
        res.status(400).json({success:false});
    }
};

exports.deleteCampground = async(req,res,next) => {
    try{
        const campground = await Campground.findById(req.params.id);

        if(!campground){
            return res.status(404).json({success : false,message:`Bootcamp not found with id of ${req.params.id}`});
        }
        campground.deleteOne();
        res.status(200).json({success : true , data : {}});
    }
    catch(err){
        res.status(400).json({success : false});
    }
};