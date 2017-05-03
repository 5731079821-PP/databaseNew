module.exports=function(app){
  var regis=require('../controllers/regis.controller');//use which controller
//app.post('/home',personal.login);//choose which function from those controller
//  app.get('/logout',personal.logout);

  //Nav
  app.get('/record',regis.record);
  app.post('/registrar',regis.search);
  app.get('/registrar',regis.rend);
	app.get('/record/pdf',regis.recordPDF);


};
