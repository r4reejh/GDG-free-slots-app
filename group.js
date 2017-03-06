var mongoose=require(mongoose);

var group=mongoose.Schema({
    name:{type:String},
    id:{type:Number,unique:true},
    members:{type:Array},
    pending:{type:Array},
    lstup:{type:Date},
    reject:{type:Array}
});


module.exports=mongoose.model('Group',group);