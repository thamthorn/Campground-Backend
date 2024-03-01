const Hospital = require('../models/Hospital');
const vacCenter = require('../models/VacCenter');

exports.getVacCenters = (req,res,next) => {
    vacCenter.getAll((err,data) => {
        if(err){
            res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving Vaccine Centers."
            });
        }
        else{
            res.send(data);
        }
    });
};



exports.getCampgrounds = async (req,res,next) => {
    try{
        // const hospitals = await Hospital.find(req.query);
        // console.log(req.query);
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
        query = Hospital.find(JSON.parse(queryStr)).populate('appointments');


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
            query = query.sort('-createdAt');
        }
        //pagination
        const page = parseInt(req.query.page,10) || 1;
        const limit = parseInt(req.query.limit,10) || 25;
        const startIndex = (page-1)*limit;
        const endIndex = page*limit;
        const total = await Hospital.countDocuments();

        query = query.skip(startIndex).limit(limit);

        //Executing query
        const hospitals = await query;
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
        res.status(200).json({success:true,count:hospitals.length,pagination, data:hospitals});
    }
    catch(err){
        res.status(400).json({success:false});
    }

};


exports.getCampground = async (req,res,next) => {
    // res.status(200).json({success:true,msg:`Show hospital ${req.params.id}`});
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital)
            return res.status(400).json({success : false});
        

        res.status(200).json({success : true , data:hospital});
    }
    catch(err){
        res.status(400).json({success:false});
    }
    

};

exports.createCampground = async (req,res,next) => {
    // console.log(req.body);
    const hospital = await Hospital.create(req.body);
    res.status(201).json({
        success: true,
        data : hospital
    });
    // res.status(200).json({success:true ,msg: 'Create new hospitals'});
};


exports.updateCampground = async (req,res,next) => {
    // res.status(200).json({success:true ,msg: `Update hospital ${req.params.id}`});
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators:true
        });

        if(!hospital){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true , data : hospital});
    }
    catch(err){
        res.status(400).json({success:false});
    }
};

exports.deleteCampground = async(req,res,next) => {
    // res.status(200).json({success:true ,msg: `Delete hospital ${req.params.id}`});

    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(404).json({success : false,message:`Bootcamp not found with id of ${req.params.id}`});
        }
        hospital.deleteOne();
        res.status(200).json({success : true , data : {}});
    }
    catch(err){
        res.status(400).json({success : false});
    }
};