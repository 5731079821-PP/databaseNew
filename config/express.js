var express=require('express');
var bodyParser=require('body-parser');
var compression=require('compression');
var morgan=require('morgan');
var validator=require('express-validator');
var passport = require('passport');
var passportLocal=require('passport-local');
var cookieParser = require('cookie-parser');
var session=require('express-session');

module.exports=function(){
  var app=express();
  if(process.env.NODE_ENV=='development'){
    app.use(morgan('dev'));
  }else{
    app.use(compression);
  }
  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.use(bodyParser.json());
  app.use(validator()); //must be right after bodyParser
  app.use(cookieParser()); //must stay before session
  app.use(session({
    secret:'conan',
    saveUninitialized:false,
    resave:false
  }));
  app.use(passport.initialize())
  app.use(passport.session())


  app.set('views','./app/views');
  app.set('view engine','jade');
  require('../app/routes/login.routes')(app);//at runtime
  require('../app/routes/layout.routes')(app);
  require('../app/routes/personal.routes')(app);
  require('../app/routes/absent.routes')(app);
  require('../app/routes/act.routes')(app);
  require('../app/routes/regis.routes')(app);
  require('../app/routes/behave.routes')(app);
  require('../app/routes/index.routes')(app);
  app.use(express.static('./public')); //order imp
  return app;
}
