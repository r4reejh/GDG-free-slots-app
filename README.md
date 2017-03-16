# GDG-free-slots-app
### All methods are POST


`url: http://localhost:3000`

### /register
```
request body: {name:'<name>',reg:'<regNo>',psswd:'<passwd>'}
success response:{uid:'<mongouid>',message:'<success>'} STATUS:200
error response:{error:'failed'} STATUS:500
```

### /create_group
```
request body:{name:'',members:[],admin:'<uid of admin>'}
success response:{admin:'',name:'',members:[],freeslots:[],pending:[],lstup:<date>,reject:[]} STATUS 200
error response:{error:'failed'} STATUS:500
```

### /respond
```
request body:{userId:'',groupId:'',status'<acccept=1,reject=2>'}
success response:{message:'success'} STATUS:200
faliure response:{error: 'failed'} STATUS:500
```

### /group_update
```
request body:{groupId:'',lstupdate:<Date>}
if Latest:
success response:{message:'latest'} STATUS:200
faliure response:{error: 'failed'} STATUS:500

if not Latest:
success response:{admin:'',name:'',members:[],freeslots:[],pending:[],lstup:<date>,reject:[]} STATUS:200
error response:{error:'failed'} STATUS:500
```

### /timetable
```
request body:{reg:'<registration number>'}
success response:{slots:[],freeslots:[]} STATUS 200
not found error response:{error:'user not found'} STATUS:404
retrieve faliure response:{error: 'retrieve failed'} STATUS:500
```

### /adduser
```
request body:{groupId:'<groupId>',reg:'<registration number>'}
success response:{message:'success'} STATUS 200
not found error response:{error:'group not found'} STATUS:404
retrieve faliure response:{error: 'retrieve failed'} STATUS:500
```

