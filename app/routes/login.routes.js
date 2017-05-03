module.exports=function(app){
  var login=require('../controllers/login.controller');//use which controller
  app.get('/login',login.login);//render login.jade
  app.post('/overview',login.authen)//render Layout.jade + Authen Check
  app.post('/signin',login.create); //render login.jadde
  app.get('/signin',login.signin);//do sign in process
  app.get('/',login.login);//render login.jade
  app.get('/logout',login.logout);//render login.jade
};
