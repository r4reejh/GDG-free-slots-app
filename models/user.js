var mongoose=require('mongoose');

var user=mongoose.Schema({
    id:{ type:Number , unique:true },
    name:{type:String},
    reg:{type:String},
    groups:[],
    slots:[],
    freeslots:[]
});


module.exports=mongoose.model('User',user);
