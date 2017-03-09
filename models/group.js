var mongoose=require('mongoose');

var group=mongoose.Schema({
	admin:{type:String},
    name:{type:String},
    members:[],
    freeslots:[],
    pending:[],
    lstup:{type:Date},
    reject:[]
});


module.exports=mongoose.model('Group',group);
