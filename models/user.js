var mongoose=require('mongoose');

var user=mongoose.Schema({
    name:{type:String},
    reg:{type:String},
    fcm:{type:String},
    groups:[],
    slots:[],
    freeslots:[]
});


module.exports=mongoose.model('User',user);
