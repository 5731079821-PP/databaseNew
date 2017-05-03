module.exports=function(app){
  var layout=require('../controllers/layout.controller');//use which controller

  //Nav
  app.get('/personal',layout.personal);
  // app.get('/registrar',layout.regis);
  // app.get('/absent',layout.absent);
  // app.get('/activity',layout.act);
  // app.get('/behave',layout.behave);
  app.get('/overview',layout.overview);
};
