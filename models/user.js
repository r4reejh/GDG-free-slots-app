var mongoose=require('mongoose');

var user=mongoose.Schema({
    id:{ type:Number , unique:true },
    name:{type:String},
    reg:{type:String},
    groups:{type:Array},
    slots:{type:Array},
    freeslots:{type:Array}
});


module.exports=mongose.model('User',user);
