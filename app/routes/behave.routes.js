module.exports=function(app){
  var behave=require('../controllers/behave.controller');//use which controller
//app.post('/home',personal.login);//choose which function from those controller
//  app.get('/logout',personal.logout);

  //Nav
  app.get('/behave',behave.rend);
  app.post('/behave',behave.search);
  app.get('/bscore',behave.indivScore);
};
