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
  console.log('Search key: '+by);
  console.log('Type choice: '+type);
  console.log('Search choice: '+select);
  console.log('Order choice: '+order);

  var query = '';
  if(select == 'undefined'){
    if(by != '')
      query += 'WHERE  s.fname = "' + by + '" or s.sid = "' + by +'"' ;
  }else if(select=='all'){
    if(by != '')
    query += 'WHERE  s.fname = "' + by + '" or s.sid = "' + by +'"' ;
  }  else{
    if(select != 'type'){
      if(select == 'assist'){
        query += ' where i.instructorId = ' + newuser.user.instructorId;
      }
      if(by != ''){
        if(select == 'assist') query += ' and (sid = ' + by + 'or name = ' + by + ')';
        else query += 'WHERE ' + select + ' = ' + by;
      }
    }
    else { // type was selected
      console.log('type : '+ type);
      if(type == undefined)  {
        dialog.err('PLEASE SELECT TYPE', 'warning', function (err) {
          return;
        })
        console.log(' in if == undefined');
        return;
      }
      else {
        console.log('   in else ');
        query += ' inner join status ss on ss.sid=s.sid where ss.type = "' +type+ '"'; // query -- student enroll subject that the teacher teach
      }
    }
  }
  if(order == 'a'){
    query += ' ORDER BY sid ASC';
  }else if(order == 'd'){
    query += ' ORDER BY sid DESC';
  }
  query = 'select s.sid, s.fname, s.lname, i.name from student s inner join instructor i on s.instructorid = i.instructorId' + query;
  console.log(query);
  var query1="select * from instructor i inner join teach t on i.instructorId=t.instructorId inner join course c on c.courseId=t.courseId where i.instructorId="+newuser.user.instructorId;
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

    res.render('allabsent',{
      student: rows.table2,
      subj: rows.table1,
      errormsg : errormsg
    })
  });
};

exports.rend=function(req,res){
  pool.query('select sid, fname, lname, instructor.name from student inner join instructor on student.instructorid = instructor.instructorId', function(err, rows, fields){
    if(err) console.error('QUERY ERROR : absent table');
   console.log('query complete');
   var errormsg='';
   if(rows == ''){
       errormsg+= 'no results';
   }
   res.render('allabsent', {
     student : rows,
     errormsg : errormsg
   });
 });
};

exports.miss=function(req,res){
  var id=req.param('id');
  console.log(id);
  var query = 'select a.courseId, a.reason, a.semester, a.year from absent a where a.sid = '+ id+' order by a.year and a.semester asc ';
  console.log(query);
  pool.query(query, function(err, rows){
    if(err) console.error('QUERY ERROR : indiv absent table');
    var mes = '';
    if(rows='') mes='never absent';
    res.render('miss',{
      id: id,
      student: rows,
      mes: mes
    });
  });
};

exports.absentPDF=function(req,res){
  pool.query('select STU.sid , STU.fname , STU.lname,STU.GPAX,STA.detail,STU.email from student STU , status STA where STU.sid = STA.sid and STU.GPAX < 2.00;',function(err, results){
    if(err) {
      console.log('QUERY ERROR : personal table with search apply');
    }else{

		var _data = {
			absent: results
		};

		var _config = {
		  margin: {
			left: 15,
			right: 15,
			top: 15,
			bottom: 15
		  }
		};

		var filePath = "./storages/pdf/absent.pdf";
		var template = __dirname + "\\..\\views\\absent_pdf.jade";

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
