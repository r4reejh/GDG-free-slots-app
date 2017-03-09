var express = require('express');
var unirest=require('unirest');
var router = express.Router();


var allSlots=[];
var User=require('../models/user');
var Group=require('../models/group');
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register',function(req,res){
	var d=req.body;
	var user=new User();
	user.reg=d.reg;
	user.name=d.name;
	unirest.post('https://myffcs.in:10443/campus/vellore/login').send({'regNo':d.reg,'psswd':d.psswd}).end(function(response){
		unirest.post('https://myffcs.in:10443/campus/vellore/refresh').send({'regNo':d.reg,'psswd':d.psswd}).end(function(re){
			var bo=re.body;
			var len=bo.courses.length();
			for(var i=0;i<len;i++){
				user.slots.push(bo.courses[i].slot);
			}
			user.save(function(err,doc){
				calcFreeSlots(doc);
				res.send(doc.id.toString());
			});
		});
	});
	//ave user to database
	//get slots info
	//calculate free slots
});

router.post('/create_group',function(req,res){
	var d=req.body;
	var group=new Group();
	group.name=d.name;
	group.pending=d.members;
	group.save(function(err,doc){
		User.findById(d.userId,function(err,doc2){
			doc2.groups.push({'name':doc.name,'id':doc.id.toString()});
		});
		res.send(doc.id.toString());
	});
	//get members information
	//sendNotification(...);
	//check if each member added is registered on the app
	//update database set all members status to pending
	//send back group_id along with status of group members
});

router.post('/respond',function(req,res){
	var user=req.body.userId;
	var grp=req.body.groupId;
	var response=req.body.response;
	User.findById(user,function(err,doc){
		Group.findById(grp,function(err,doc){
			if(response=='1')
			grp.members.push(doc.reg);
			else if(response=='2')
			grp.reject.push(doc.reg);
			grp.pending=grp.pending.splice(grp.pending.indexOf(doc.reg),1);
		});
	});
	//recieve request as: {groupid:<data>,status:<code>}
	//send back response based on database result
	//sendnotification(...)
	//update common free-slots
	//send response as json to update app_local_database>groups
});

router.post('/message',function(req,res){
	//recieve request as: {groupid:<data>,message:<code>}
	//send back confirmation as <message received by server, pushed by server>
	//sendMessageNotification(...)
});

router.post('/group_info_update',function(req,res){
	//receive request as: {}
});

router.post('')

module.exports = router;


//----------------METHODS-----------------------------------------------
function calcFreeSlots(user){
	var c=user.slots.join(" ");
	c=c.replace('+',' ');
	var arr=c.split(' ');
	var free=[];
	allSlots.forEach(function(item){
		if(arr.indexOf(item)<0)
		free.push(item);
	});
	user.freeslots=free;
	user.save(function(err,doc){
		if(err)
		console.log(err);
	});
}
