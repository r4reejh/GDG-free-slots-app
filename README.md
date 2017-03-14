# GDG-free-slots-app
## All methods are POST


`url: http://localhost:3000`

localhost:3000/register


`request body: {name:'<name>',reg:'<regNo>',psswd:'<passwd>'}
success response:{uid:'<mongouid>',message:'<success>'} STATUS:200
error response:{error:'failed'} STATUS:500`

`/create_group
request body:{name:'',members:[],admin:'<uid of admin>'}
success response:{admin:'',name:'',members:[],freeslots:[],pending:[],lstup:<date>,reject:[]} STATUS 200
error response:{error:'failed'} STATUS:500`

`/respond
request body:{userId:'',groupId:'',status'<acccept=1,reject=2>'}
success response:{message:'success'} STATUS:200
faliure response:{error: 'failed'} STATUS:500`

`/group_update
request body:{groupId:'',lstup:<Date>}
if Latest:
  success response:{message:'latest'} STATUS:200
  faliure response:{error: 'failed'} STATUS:500
if not Latest:
  success response:{admin:'',name:'',members:[],freeslots:[],pending:[],lstup:<date>,reject:[]} STATUS 200
  error response:{error:'failed'} STATUS:500`
