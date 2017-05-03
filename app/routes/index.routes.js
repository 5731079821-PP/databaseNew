// so did we have index page or overview or something that cannot put in other routes fileter
// put it here -- i think -- Bee
module.exports=function(app){
  app.get('/try', function(req, res){
      res.render('try');
  });
};
