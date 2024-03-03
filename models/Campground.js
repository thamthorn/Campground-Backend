const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please add a name'],
        unique: true,
        trim:true,
        maxlenght:[50,'Name can not be more than 50 characters']
        },
    address: {
        type: String,
        required: [true, 'Please add an address']
        },
    tel:{
        type: String,
        match:[
            /^(()?\d{3}())?(-|\s)?\d{3}(-|\s)\d{4}$/,
            'Please add a valid telephone number'
        ]
        },
        
    
}, {
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});


//Cascade delete bookings when a campground is deleted
CampgroundSchema.pre('deleteOne',{document:true , query:false},async function(next) {
    console.log(`Bookings being removed from campground ${this._id}`);
    await this.model('Booking').deleteMany({campground: this._id});
    next();
})

//Reserve populate with virtuals
CampgroundSchema.virtual('bookings',{
    ref:'Booking',
    localField:'_id',
    foreignField:'campground',
    justOne:false
});

module.exports = mongoose.model('Campground',CampgroundSchema);