module.exports=function(app){
  var act=require('../controllers/act.controller');//use which controller
//app.post('/home',personal.login);//choose which function from those controller
//  app.get('/logout',personal.logout);

  //Nav
  app.get('/activity', act.rend);
  app.post('/activity',act.search);
	app.get('/activity/pdf',act.activityPDF);
};
