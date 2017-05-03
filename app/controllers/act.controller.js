// var mysql = require('mysql');
var async = require('async');
var pool = require('../../sql');
var dialog = require('dialog');
var newuser=require('../routes/User');
require('./login.controller');
var fs = require("fs");
var report = require("jade-reporting");

exports.search=function(req,res){
  var by=req.body.by;
  var select=req.body.select;
  var type=req.body.type;
  var order=req.body.order;
  var date=req.body.date;//2017-04-13 this format
  console.log('Search key: '+by);
  console.log('select : '+select);
  console.log('type choice: '+type);
  console.log('Order choice: '+order);
  console.log('Date choice: '+date);
  var query = 'select a.name, a.type, a.prize, p.sid, a.assistant, DATE_FORMAT(a.date,"%b %e, %Y") as date , s.fname, s.lname from activity a '+
  'inner join paticipate p on a.activityid = p.activityId '+
  'inner join student s on s.sid= p.sid';

  if(select == 'id'){
    query += ' where s.sid like "%'+by+'%"';
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
        query += ' where s.fname = "'+fname+'" and s.lname like "%'+lname+'%" ';
      }else{
        query += ' where s.fname like "%'+by+'%" ';
      }
    }
  }else if(select == 'assist'){
    query += ' inner join instructor i on s.instructorid=i.instructorId where i.instructorId = '+newuser.user.instructorId;
  }else if(select == 'date'){
    if(date == ''){
      dialog.err('PLEASE CHOOSE DATE', 'warning', function (err) {
        return;
      });
    }
    else {
      query += ' where date = "'+date+'" ';
    }
  }else if(select == 'activity'){
    query += ' where a.name like "%'+by+'%"';
  }else if(select == ' projectAssist'){
    query += ' where a.assistant like "%'+by+'%"';
  }

  if(type!='' && type!=undefined){
    if(query.indexOf('where') == -1) query +=' where ';
    else query+=' and ';
    query += ' a.type="'+type+'" ';
  }
  console.log(date);
  console.log(query);
  pool.query(query, function(err, rows){
    if(err) console.error('QUERY ERROR : activity with search apply');
    var errormsg='';
    if(rows=='') errormsg="NO RESULTS";
    res.render('act',{
      student : rows,
      errormsg : errormsg
    });
  });

};

exports.home=function(req,res){
  res.render('layout',{
    User: 'ID: '+req.session.inID+'  ',
    subtitle: 'Overview'
  });
};

exports.rend=function(req,res){
  var query='select a.name, a.type, a.prize, p.sid, a.assistant, DATE_FORMAT(a.date,"%b %e, %Y") as date , s.fname, s.lname from activity a '+
  'inner join paticipate p on a.activityid = p.activityId '+
  'inner join student s on s.sid= p.sid';
  pool.query(query, function(err, rows){
    if(err) console.error('QUERY ERROR : activity table');
    var errormsg='';
    if(rows=='') errormsg + 'NO RESULTS';
    res.render('act',{
      student : rows,
      errormsg : errormsg
    });
  });
  // res.render('act');
};

exports.activityPDF=function(req,res){
  pool.query('select P.activityId, A.name ,A.type,A.prize,P.sid,A.assistant,A.date FROM paticipate P , activity A where P.activityId = A.activityid',function(err, results){
    if(err) {
      console.log('QUERY ERROR : personal table with search apply');
    }else{

		var _data = {
			activity: results
		};


		var _config = {
		  margin: {
			left: 15,
			right: 15,
			top: 15,
			bottom: 15
		  }
		};

		var filePath = "./storages/pdf/activity.pdf";
		var template = __dirname + "\\..\\views\\activity_pdf.jade";

		report.generate(template, filePath, _data, _config, function(err){
			if(err){
				console.log(err);
				return false;
			}

			fs.readFile(filePath, function(err, pdf) {
				res.contentType("application/pdf");
				res.send(pdf);
			});
		});
	}
  });
};
