var connection=require('../../sql');
var newuser=require('../routes/User');
exports.login=function(req,res){
  res.render('login',{
  });
};
exports.signin=function(req,res){
  res.render('signin');//render signin.jade
};
exports.create=function(req,res){
  console.log(req.body.usr);
  console.log(req.body.pwd);
  console.log(req.body.inID);
  console.log(req.body.status);
  connection.query('SELECT password FROM login WHERE instructorId = ?',req.body.inID,function(err,result){
  if(!result.length){//if already register -> warning and stay in signin.jade
    var data  = {
      user: req.body.usr,
      password: req.body.pass,
      status:req.body.status,
      instructorId:req.body.inID};
    connection.query('INSERT INTO login SET ?', data, function(err, result) {
      console.log(result);
    });
      res.render('login');//render login.jade
  }else{//if new user->insert data into login table
        res.render('signin',{
          sms:'You already have an account!'
        });
  }
  });
};
exports.authen=function(req,res){

  var data  = {
    instructorId:req.body.inID,
    password: req.body.pass,
    status:req.body.status
    };
  req.session.save();
  req.session.inID=data.instructorId;
  connection.query('SELECT password, user FROM login WHERE instructorId = ?', data.instructorId,function(err,result){
    //console.log('goi');
    if(!result.length||result[0].password!==data.password){//if password incorrect
        console.log(result.password);
        console.log(data.password);
        res.render('login',{
          sms: 'Incorrect Instructor ID or Password!'
        });
    }else{
      newuser.setUser(data.instructorId);
      console.log(newuser.user);
      res.render('graph3',{
        User: 'ID: '+req.session.inID+'  ',
        subtitle: 'Overview'
      }); //render layout.jade /overview path
    }
  });
};
exports.logout=function(req,res){
   newuser.delUser();
  req.session.destroy();
  res.render('login');//render signin.jade
};
