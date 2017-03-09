var mongoose=require('mongoose');

var group=mongoose.Schema({
    name:{type:String},
    id:{type:Number,unique:true},
    members:{type:Array},
    pending:[],
    lstup:{type:Date},
    reject:[]
});


module.exports=mongoose.model('Group',group);
