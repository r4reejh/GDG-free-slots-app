var mongoose=require('mongoose');

var user=mongoose.Schema({
    name:{type:String},
    reg:{type:String},
    fcm:{type:String},
    groups:[],
    slots:[],
    freeslots:[],
    private:{type:String,default:"0"}
});


module.exports=mongoose.model('User',user);
