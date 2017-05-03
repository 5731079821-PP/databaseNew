// var mysql = require('mysql');
var async = require('async');
var pool = require('../../sql');
var dialog = require('dialog');
var newuser=require('../routes/User');
require('./login.controller');

exports.search=function(req,res){
  var by=req.body.by;
  var select=req.body.select;
  var order=req.body.order;
  // var type=req.body.type;
  var score=req.body.score;
  console.log('Search key: '+by);
  console.log('Search choice: '+select);
  console.log('Order choice: '+order);
  // console.log('Type choice: '+type);
  console.log('range of score: '+score);
  var query = '';
  if(select == 'undefined'){
    //do noting
  }else if(select == 'id'){
    if(by == ''){
      dialog.err('PLEASE FILL STUDENT ID IN THE BOX', 'warning', function (err) {
        return;
      });
      return;
    }
    else query += ' where sid like '+'"%'+by+'%"';
  }else if(select == 'name'){
    if(by == ''){
      dialog.err('PLEASE FILL NAME IN THE BOX', 'warning', function (err) {
        return;
      });
      return;
    }else {
      if(by.indexOf(' ')>-1){// fname and lname
        fname = by.substr(0, by.indexOf(' '));
        lname = by.substr(by.lastIndexOf(' ')+1,by.length);
        query += ' where fname = "'+fname+'" and lname like "%'+lname+'%" ';
      }else{
        query += ' where fname like "%'+by+'%" ';
      }
    }
  }else if(select == 'score'){
    var num1, num2;
    by = by.trim();
    num1 = by.indexOf(' ');
    if(num1==-1) num1 = by.indexOf('-');

    num1 = by.substr(0,num1);
    num2 = by.lastIndexOf(' ');
    if(num2==-1) num2 = by.lastIndexOf('-');
    if(num2==-1 || num1 == -1){
      dialog.err('RANGE IS IN FORMAT : <min> - <max>', 'warning', function (err) {
        return;
      });
    }else {
      num2 = by.substr(num2+1, by.length);
      if(num2<num1){
        var temp = num1;
        num1 = num2;
        num2 = temp;
      }
      query += " where s.behaviorScore >= " + num1 +" and s.behaviorScore <= " + num2;
    }
  } else if(select == 'assist'){
        query += ' where i.instructorId = ' + newuser.user.instructorId;
          if(by != '') query += ' and name = "'+by+'"';
  }

  if(order == 'a'){
    query += ' ORDER BY sid ASC';
  }else if(order == 'd'){
    query += ' ORDER BY sid DESC';
  }
  query = 'select s.sid, s.fname, s.lname, s.behaviorScore, GPAX from student s inner join instructor i on s.instructorId=i.instructorId' + query;
  console.log(query);
  var query1="select * from instructor i left join teach t on i.instructorId=t.instructorId inner join course c on c.courseId=t.courseId where i.instructorId="+newuser.user.instructorId;
  var row = [];

  var return_data = {};
  var errormsg="";

  async.parallel([
    function(parallel_done){
      pool.query(query1, {}, function(err, rows){
        if (err) return parallel_done(err);
        return_data.table1 = rows;
        parallel_done();
      });
    },
    function(parallel_done){
      pool.query(query, {}, function(err, rows){
        if(err) return parallel_done(err);
        if(rows =='') errormsg += 'no results';
        return_data.table2 = rows;
        parallel_done();
      });
    }
  ], function(err){
    if(err) console.error(err);

    row = JSON.stringify(return_data);
    rows = JSON.parse(row);

    res.render('behave',{
      student: rows.table2,
      subj: rows.table1,
      errormsg : errormsg
    })
  });
};
exports.rend=function(req,res){
  pool.query('select sid, fname, lname, behaviorScore, GPAX from student', function(err, rows){
      if(err) console.error('QUERY ERROR : all behavior table');
      var errormsg='';
      if(rows == ''){
          errormsg+= 'no results';
      }
      res.render('behave', {
        student : rows,
        errormsg : errormsg
      });
  });
};

exports.indivScore=function(req,res){
  var id = req.param('id');
  var balance = req.param('bescore');
  console.log('id : '+id+' -- balance : '+ balance);
  var query = 'select r.ruleId, r.name, DATE_FORMAT(t.date,"%b %e, %Y") as date, t.time from time t inner join rule r on t.ruleId=r.ruleId where t.sid='+ id;

  pool.query( query, function(err, rows){
    if(err) console.error('QUERY ERROR : show indiv behaviorScore');
    var total='balance score : '+balance;
    var sid = 'Student ID : ';
    sid += id;
    res.render('bscore',{
      sid: sid,
      student: rows,
      total: total
    });
  });
};
