module.exports=function(app){
  var personal=require('../controllers/personal.controller');//use which controller
//app.post('/home',personal.login);//choose which function from those controller
//  app.get('/logout',personal.logout);
  // var absent=require('../controllers/absent.controller');

  //Nav
  app.get('/allpersonal', personal.rend);
  app.post('/allpersonal',personal.search);
  app.get('/profile',personal.profile);
  app.get('/allpersonal/pdf',personal.allpersonalPDF);
  app.get('/personal/pdf',personal.personalPDF);

};
