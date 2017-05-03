var user={
	instructorId:''
};
var setUser=function(id){
user.instructorId=id;
}
var delUser=function(){
	user.instructorId=''
}

exports.user=user;
exports.setUser=setUser;
exports.delUser=delUser;
