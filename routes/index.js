var express = require('express');
var unirest=require('unirest');
var router = express.Router();


var allSlots=['A1','A2','B1','B2','C1','C2','D1','D2','E1','E2','F1','F2','TA1','TA2','TB1','TB2','TC1','TC2','TD1','TD2','TE1','TE2','TF1','TF2'];
var timings={};

var User=require('../models/user');
var Group=require('../models/group');


router.get('/', function(req, res, next) {
  res.send('free-slots-backend-api');
});

router.post('/register',function(req,res){
	var d=req.body;
	var user;
	user.reg=d.reg;
	// user.name=d.name;
	User.findOne({'reg':d.reg},function(err,data){
		if(data.length>0)
		user=data;
		else
		user=new User();
		unirest.post('https://myffcs.in:10443/campus/vellore/login').send({'regNo':d.reg,'psswd':d.psswd}).end(function(response){
		if(response.status.code=='0'){
		unirest.post('https://myffcs.in:10443/campus/vellore/refresh').send({'regNo':d.reg,'psswd':d.psswd}).end(function(re){
			if(re.body.length>6){
			var bo=re.body;
			var len=bo.courses.length;
			user.name = bo.name;
			for(var i=0;i<len;i++){
				user.slots.push(bo.courses[i].slot);
				//console.log(bo.courses[i].slot);
				if(i==len-1){
						user.save(function(err,u){
							calcFreeSlots(u);
							if(err)
							console.log(err);
							console.log(u);
							res.send(u.id);
						});
						//console.log(user);
				}
			}
		}
		else{
      res.status(404);
			res.send({'message':'failed'});
		}

		});
	}
	else{
    res.status(404);
		res.send({'message':'failed'});
	}
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
	group.admin=d.userId;

	User.findById(d.userId,function(err,userobj){
		userobj.groups.push({'name':group.name.name,'id':group.id});
		group.members.push({'u_id':userobj.id,'freeslots':userobj.freeslots});
	});

	group.save(function(err,doc){
		doc.members.forEach(function(item){
			User.findOne({'reg':item},function(err,mem){
				//sendNotification(mem.id);
			});
		});
		res.send(doc.id);
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
	User.findById(user,function(err,usr){
		Group.findById(grp,function(err,group){
      if(!err){
  			if(response=='1')
  			grp.members.push({'u_id':doc.reg,'freeslots':doc.freeslots});
  			else if(response=='2')
  			grp.reject.push(doc.reg);
  			grp.pending=grp.pending.splice(grp.pending.indexOf(doc.reg),1);
        usr.groups.push(grp.id);
      }
      else{
        res.status()
      }
		});
	});
	//recieve request as: {groupid:<data>,status:<code>}
	//send back response based on database result
	//sendnotification(...)
	//update common free-slots
	//send response as json to update app_local_database>groups
});


router.post('/group_update',function(req,res){
	var version_date=req.body.lstupdate;
  var r_group=req.body;
  Group.findById(r_group.groupId,function(err,grp){
    if(!err){
      if(grp.lstupdate)
      res.send({'message':'updated'});
      else
      res.send(grp);
    }
    else{
      res.status(500);
      res.send({'message':'error'});
    }
  });
});

module.exports = router;
//----------------METHODS-----------------------------------------------
function calcFreeSlots(user){
	var c=user.slots.join(" ");
	//console.log(c);
	c=c.replace(/\+/g,' ');
	//console.log(c);
	var arr=c.split(' ');
	console.log(arr);
	var free=[];
	allSlots.forEach(function(item){

	});
	for(var i=0;i<allSlots.length;i++){
		if(arr.indexOf(allSlots[i])<0)
		free.push(allSlots[i]);
		if(i==allSlots.length-1){
			user.freeslots=free;
			user.save(function(err,doc){
				if(err)
				console.log(err);
				console.log(doc);
			});
		}
	}
}
