module.exports=function(app){
  var absent=require('../controllers/absent.controller');//use which controller
//app.post('/home',personal.login);//choose which function from those controller
//  app.get('/logout',personal.logout);

  //Nav
  app.post('/absent',absent.search);
  app.get('/absent',absent.rend);
  app.get('/miss',absent.miss);
	app.get('/absent/pdf',absent.absentPDF)
};
