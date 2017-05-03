// var mysql = require('mysql');
var async = require('async');
var pool = require('../../sql');
var dialog = require('dialog');
var newuser=require('../routes/User');
require('./login.controller');
var fs = require("fs");
var report = require("jade-reporting");

exports.search=function(req,res){
  var by=req.body.by;         //search
  var select=req.body.select; //filter dropdown
  var order=req.body.order;   //ascending - Decending
  var course=req.body.course;// if fileter choice -- select course */
  console.log('Search key: '+by);
  console.log('Search choice: '+select);
  console.log('Order choice: '+order);
  console.log('Course choice: '+course);
  var query = '';
  if(select == 'undefined'){
  } else{
    if(select != 'course'){
      if(select == 'sid'){
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
      }else if(select == 'assist'){
        query += ' inner join instructor i on s.instructorid = i.instructorId '+
        'where i.instructorId = ' + newuser.user.instructorId;
        if(by != '') query += ' and (sid = ' + by + 'or name = ' + by + ')';
      }

    }
    else { // select : course
      console.log('course : '+ course);
      if(course == undefined)  {
        dialog.err('PLEASE SELECT COURSE', 'warning', function (err) {
          return;
        });
        return;
      }
      else {
        console.log('   in else ');
        query += ' inner join enroll e on s.sid = e.sId inner join course c on c.courseId = e.courseId where s.instructorid = '+newuser.user.instructorId+' and e.courseId = ' + course ; // query -- student enroll subject that the teacher teach
      }
    }
  }
  if(order == 'a'){
    query += ' ORDER BY sid ASC';
  }else if(order == 'd'){
    query += ' ORDER BY sid DESC';
  }
  query = 'SELECT s.sid, s.fname, s.lname, s.GPAX FROM student s ' + query;
  console.log(query);
  var query1="select * from instructor i inner join teach t on i.instructorId=t.instructorId inner join course c on c.courseId=t.courseId where i.instructorId="+newuser.user.instructorId;
  var row = [];

  var return_data = {};
  var errormsg = '';
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
        if(rows == '') errormsg = 'no results';
        return_data.table2 = rows;
        parallel_done();
      });
    }
  ], function(err){
    if(err) console.error(err);

    row = JSON.stringify(return_data);
    rows = JSON.parse(row);

    res.render('allpersonal',{
      student: rows.table2,
      subj: rows.table1,
      errormsg: errormsg
    })
  });
};

exports.profile=function(req,res){
  var id = req.param('id');
  console.log(id);
  pool.query('select *,DATE_FORMAT(s.dateOfBirth,"%b %e, %Y") as bdate from student s inner join department d on s.departmentId = d.departmentId inner join faculty f on d.facultyId = f.facultyId WHERE sid = ?', id, function(err, rows, fields){
    if(err){
      console.log('individual info query error');
    }else {
      console.log(rows);
      var gender;
      if(rows[0].gender == 'M') gender = 'ชาย';
      else gender = 'หญิง'
      res.render('profile', {
        indiv : rows[0],
        gender : gender
      });
    }
  });
};

exports.rend=function(req,res){
  var query2="SELECT sid, fname, lname, GPAX from student";
  var query1="select * from instructor i inner join teach t on i.instructorId=t.instructorId inner join course c on c.courseId=t.courseId where i.instructorId="+newuser.user.instructorId;
  var row = [];

  var return_data = {};
  var errormsg='';
  async.parallel([
    function(parallel_done){
      pool.query(query1, {}, function(err, rows){
        if (err) return parallel_done(err);
        return_data.table1 = rows;
        parallel_done();
      });
    },
    function(parallel_done){
      pool.query(query2, {}, function(err, rows){
        if(err) return parallel_done(err);
        if(rows=='') errormsg+='no results';
        return_data.table2 = rows;
        parallel_done();
      });
    }
  ], function(err){
    if(err) console.error(err);

    row = JSON.stringify(return_data);
    rows = JSON.parse(row);

    res.render('allpersonal',{
      student: rows.table2,
      subj: rows.table1,
      errormsg: errormsg
    })
  });
};

exports.allpersonalPDF=function(req,res){
  pool.query('SELECT * FROM student',function(err, results){
    if(err) {
      console.log('QUERY ERROR : personal table with search apply');
    }else{

		var _data = {
			student: results
		};


		var _config = {
		  margin: {
			left: 15,
			right: 15,
			top: 15,
			bottom: 15
		  }
		};

		var filePath = "./storages/pdf/allpersonal.pdf";
		var template = __dirname + "\\..\\views\\allpersonal_pdf.jade";

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

exports.personalPDF=function(req,res){

  pool.query('SELECT * FROM student WHERE sid = ?',req.query.sid, function(err, results){
    if(err) {
      console.log('QUERY ERROR : personal table with search apply');
    }else{

		var _data = {
			student: results[0]
		};

		console.log(_data)

		var _config = {
		  margin: {
			left: 15,
			right: 15,
			top: 15,
			bottom: 15
		  }
		};

		var filePath = "./storages/pdf/personal.pdf";
		var template = __dirname + "\\..\\views\\personal_pdf.jade";

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
