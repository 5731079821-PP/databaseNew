var connection=require('../../sql');
var newuser=require('../routes/User');
require('./login.controller');
exports.overview=function(req,res){
  res.render('graph3',{
    User: 'ID: '+req.session.inID+'  ',
    subtitle: 'Overview'
  });
};

exports.personal=function(req,res){
  res.render('personal');
};
exports.regis=function(req,res){
  res.render('regis');
};
exports.personal=function(req,res){
  res.render('personal');
};
exports.act=function(req,res){
  res.render('act');
};
exports.behave=function(req,res){
  res.render('behave');
};
exports.absent=function(req,res){
  res.render('absent');
};
