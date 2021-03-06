var express = require('express');
var unirest = require('unirest');

var router = express.Router();

//Initialize the firebase app
var admin = require("firebase-admin");
//Make a firebase project and fill these credentials
admin.initializeApp({
	credential: admin.credential.cert({
		projectId: "<PROJECT_ID>",
		clientEmail: "foo@<PROJECT_ID>.iam.gserviceaccount.com",
		privateKey: "-----BEGIN PRIVATE KEY-----\n<KEY>\n-----END PRIVATE KEY-----\n"
	}),
	databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});

var allSlots = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2', 'TA1', 'TA2', 'TB1', 'TB2', 'TC1', 'TC2', 'TD1', 'TD2', 'TE1', 'TE2', 'TF1', 'TF2'];
var timings = {};

var User = require('../models/user');
var Group = require('../models/group');


router.get('/', function (req, res, next) {
	res.send('free-slots-backend-api');
});

router.post('/register', function (req, res) {
	var d = req.body;
	var user;
	User.findOne({ 'reg': d.reg }, function (err, data) {
		if (data)
			user = data;
		else
			user = new User();
		unirest.post('https://myffcs.in:10443/campus/vellore/login').send({ 'regNo': d.reg, 'psswd': d.psswd }).end(function (response) {
			if (response.body.status.code == 0) {
				unirest.post('https://myffcs.in:10443/campus/vellore/refresh').send({ 'regNo': d.reg, 'psswd': d.psswd }).end(function (re) {
					if (true/*re.body.length>6*/) {
						var bo = re.body;
						var len = bo.courses.length;
						user.reg = d.reg;
						user.fcm = d.fcm;
						user.name = bo.name;
						var slots_a=[];
						for (var i = 0; i < len; i++) {
							slots_a.push(bo.courses[i].slot);
							if (i == len - 1) {
								user.slots=slots_a;
								user.save(function (err, u) {
									calcFreeSlots(u);
									if (err)
										console.log(err);
									res.status(200);
									res.send({ 'user_id': u.id, 'message': 'success' });
								});
							}
						}
					}
					else {
						res.status(404);
						res.send({ 'message': 'failed' });
					}

				});
			}
			else {
				res.status(404);
				res.send({ 'message': 'api failed' });
			}
		});
	});
});

router.post('/create_group', function (req, res) {
	var d = req.body;
	var group = new Group();
	group.name = d.name;
	group.pending = d.members;
	group.admin = d.userId;

	User.findById(d.userId, function (err, userobj) {
		if (userobj) {
			userobj.groups.push({ 'name': group.name, 'id': group.id });
			group.members.push({ 'u_id': userobj.id, 'freeslots': userobj.freeslots });
		}
	});

	group.save(function (err, grp) {
		if (!err) {
			grp.members.forEach(function (regId) {
				User.findOne({ 'reg': regId }, function (err, mem) {
					//create group
					//sendNotification(mem.id) to group;  I dont know how to get FCM token in this case...u just have to call send notification method...CONFUSED b/w members and pendingxD
				});
			});
			res.status(200);
			res.send(grp);
		}
		else {
			res.status(500);
			res.send({ 'error': 'could not create group' });
		}
	});
	//get members information
	//sendNotification(...);
	//check if each member added is registered on the app
	//update database set all members status to pending
	//send back group_id along with status of group members
});

router.post('/respond', function (req, res) {
	var user = req.body.userId;
	var group = req.body.groupId;
	var response = req.body.response;
	User.findById(user, function (err, usr) {
		Group.findById(group, function (err, grp) {
			if (!err) {
				grp.lstup = new Date().toISOString();
				if (response == '1')
					grp.members.push({ 'u_id': doc.reg, 'freeslots': usr.freeslots });
				else if (response == '2')
					grp.reject.push(doc.reg);
				grp.pending = grp.pending.splice(grp.pending.indexOf(usr.reg), 1);
				usr.groups.push(grp.id);
				grp.save(function (er1, g) {
					usr.save(function (er2, u) {
						if ((!er1) && (!er2)) {
							res.status(200);
							res.send({ 'message': 'success' });
						}
						else {
							res.status(500);
							res.send({ 'error': 'database update failed' });
						}
					});
				});
			}
			else {
				res.status(500);
				res.send({ 'error': 'failed update' });
			}
		});
	});
	//recieve request as: {groupid:<data>,status:<code>}
	//send back response based on database result
	//sendnotification(...)  Why do you want to send notification in this case
	//update common free-slots
	//send response as json to update app_local_database>groups
});


router.post('/group_update', function (req, res) {
	var version_date = req.body.lstupdate;
	var r_group = req.body;
	Group.findById(r_group.groupId, function (err, grp) {
		if (!err) {
			if (grp.lstupdate === version_date)
				res.send({ 'message': 'updated' });
			else {
				res.status(200);
				res.send(grp);
			}
		}
		else {
			res.status(500);
			res.send({ 'message': 'error' });
		}
	});
});

router.post('/privacy',function(req,res){
	User.find({'reg':req.body.reg}).limit(1).exec(function(err,usr){
		if(err){
			res.status(500);
			res.send({'message':'database retrieve err'});
		}
		else{
			if(usr.length==0){
				res.status(404);
				res.send({'message':'user not found'});
			}
			else{
				console.log(req.body.code);
				usr[0].private=req.body.code;
				usr[0].save(function(err,doc){
					res.status(200);
					res.send({'message':'changed privacy settings'});
				});
			}
		}
	});
});

router.post('/timetable', function (req, res) {
	User.find({ 'reg': req.body.reg }).limit(1).exec(function (err, usr) {
		if (!err) {
			if (usr.length>0) {
				res.status(200);
				//res.send(usr);
				console.log(usr.private);
				if(usr[0].private=="1"){
					res.send({ 'slots': usr[0].slots, 'freeslots': usr[0].freeslots });
				}
				else{
					res.send({'message':'user has not made their timetable public'});
				}
			}
			else {
				res.status(404);
				res.send({ 'error': 'user not found' });
			}
		}
		else {
			res.status(500);
			res.send({ 'error': 'failed retrieve' })
		}
	});
});

router.post('/adduser', function (req, res) {
	var groupId = req.body.groupId;
	var mem_reg = req.body.reg;
	Group.findById({ groupId }, function (err, grp) {
		if (!err) {
			if (grp) {
				grp.lstup = new Date().toISOString();
				grp.pending.push(mem_reg);
				User.findOne({reg:mem_reg},function(err,data){
					var fcm  = data.fcm;
					var grpName = grp.name;
					var adminName  = grp.admin;
					sendNotification(fcm , grpName, admin);
				});
				grp.save(function (err, g) {
					if (!err) {
						res.status(200);
						res.send({ 'message': 'success' });
					}
					else {
						res.status(500);
						res.send({ 'error': 'database update failed' });
					}
				});
			}
			else {
				res.status(404)
				res.send({ 'error': 'group not found' });
			}
		}
		else {
			res.status(500);
			res.send({ 'error': 'retrieve error' });
		}
	});
});

router.post('/remove_member', function (req, res) {
	var groupId = req.body.groupId;
	var adminId = req.body.adminId;
	var rem_uId = req.body.user;

	Group.findById({ groupId }, function (err, grp) {
		if (!err && grp) {
			if (grp.admin == adminId) {
				if (grp.members.indexOf(rem_uId) >= 0) {
					grp.members = grp.members.splice(grp.members.indexOf(rem_uId), 1);
					grp.save(function (err, doc) {
						if (!err) {
							res.status(200);
							res.send({ 'message': 'success' });
						}
						else {
							res.status(500);
							res.send({ 'error': 'database update failed' });
						}
					});
				}
				else {
					res.status(404);
					res.send({ 'error': 'not a member of group' });
				}
			}
			else {
				res.status(400);
				res.send({ 'error': 'unauthorised access' });
			}
		}
		else if (err) {
			res.status(500);
			res.send({ 'error': 'retrieve failed' });
		}
		else {
			res.status(404);
			res.send({ 'error': 'group not found' });
		}

	});
});

module.exports = router;

//----------------METHODS-----------------------------------------------
function calcFreeSlots(user) {
	var c = user.slots.join(" ");
	c = c.replace(/\+/g, ' ');
	var arr = c.split(' ');
	var free = [];
	for (var i = 0; i < allSlots.length; i++) {
		if (arr.indexOf(allSlots[i]) < 0)
			free.push(allSlots[i]);
		if (i == allSlots.length - 1) {
			user.freeslots = free;
			user.save(function (err, doc) {
				if (err)
					console.log(err);
				//sconsole.log(doc);
				//console.log(doc);
			});
		}
	}
}
//Give the FcmRegToken , group name and admin name 
function sendNotification(fcm, grpname, adminName) {
	var payload = {
		data: "Invite for group: " + grpname + " by " + adminName
	};
	admin.messaging().sendToDevice(fcm, payload)
		.then(function (response) {
			console.log("Successfully sent message:", response);
		})
		.catch(function (error) {
			console.log("Error sending message:", error);
		});
}

//-------------------SEND NOTIFICATION----------------------------------
