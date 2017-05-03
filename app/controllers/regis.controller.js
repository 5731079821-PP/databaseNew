var pool=require('../../sql');
var dialog=require('dialog');
var newuser=require('../routes/User');
require('./login.controller');
var fs = require("fs");
var report = require("jade-reporting");

exports.search=function(req,res){
  var by=req.body.by;
  var select=req.body.select;
  var order=req.body.order;
  var year=req.body.year;
  var grade=req.body.grade;
  console.log('insID : '+newuser.user.instructorId);
  console.log('Search key: '+by);
  console.log('select choice: '+select);
  console.log('Order choice: '+order);
  console.log('year choice: '+year);
  var query = 'select s.sid, s.fname, s.lname, s.GPAX, a.GPA, a.year, a.term from student s left join academicrecord a on s.sid=a.sid ';
  if(select != undefined){
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
      query += ' where s.instructorid = '+/*session instructorid*/ newuser.user.instructorId;
    }else if(select == 'year'){
      if(year == undefined){
        dialog.err('PLEASE SELECT YEAR', 'warning', function (err) {
          return;
        });
        return;
      }
      else query += ' where idtoyear(s.sid) '+ year;
    }else if(select == 'gpax'){
      if(by == ''){
        dialog.err('PLEASE FILL COMPARE GPAX IN THE BOX', 'warning', function (err) {
          return;
        });
        return;
      }
      else query += ' where s.GPAX '+grade+by;
    }
  }
  query += ' order by s.sid, a.year, a.term asc';
  var jsonstr = '[';
  pool.query(query, function(err, rows){
    if(err) console.error('QUERY ERROR : search registrar table');
    console.log(rows);
    console.log('query success');
    var aobj, bobj;
    var prevID;
    var year;
    var sem=['1st','2nd','S'];
    console.log(rows.length);
    for(var i=0; i<rows.length; i++){
      aobj=rows[i];
      year=aobj.year-1;
      jsonstr += '{"sid":'+rows[i].sid+','+
        '"fname": "'+aobj.fname+'",'+
        '"lname": "'+aobj.lname+'",'+
        '"GPAX": '+aobj.GPAX+','+
          // set grade of all semester to ''-''
        '"y'+(aobj.year-year)+'_'+sem[0]+'": "'+'-'+'",'+
        '"y'+(aobj.year-year)+'_'+sem[2]+'": "'+'-'+'",'+
        '"y'+(aobj.year-year)+'_'+sem[1]+'": "'+'-'+'",'+

        '"y'+(aobj.year-year)+'_'+sem[aobj.term-1]+'": '+aobj.GPA;
      var prevyear = aobj.year;
      console.log('i='+i);
      for(var j=i+1; j<rows.length; j++){
        console.log('in if : i='+i+' j='+j);
        bobj=rows[j];
        if(aobj.sid == bobj.sid){
          if(prevyear != bobj.year){
            jsonstr += ','+
              '"y'+(bobj.year-year)+'_'+sem[0]+'": "'+'-'+'",'+
              '"y'+(bobj.year-year)+'_'+sem[1]+'": "'+'-'+'",'+
              '"y'+(bobj.year-year)+'_'+sem[2]+'": "'+'-'+'"';
            prevyear = bobj.year;
          }
          jsonstr += ','+
            '"y'+(bobj.year-year)+'_'+sem[bobj.term-1]+'": '+bobj.GPA;
        }else{
          // console.log(' in else ');
          i=j-1;
          var fillyear=rows[j-1].year-aobj.year;
          fillyear+=2;
          // console.log(' fillyear '+fillyear);
          for( fillyear; fillyear<=4; fillyear++){
            // console.log( fillyear);
            jsonstr += ','+
              '"y'+(fillyear)+'_'+sem[0]+'": "'+'-'+'",'+
              '"y'+(fillyear)+'_'+sem[1]+'": "'+'-'+'",'+
              '"y'+(fillyear)+'_'+sem[2]+'": "'+'-'+'"';
          }
          jsonstr += '},';
          break;
        }
      }
      if(i == rows.length-1 ){
        for(var fillyear=(rows[i].year-year)+1; fillyear<=4; fillyear++){
          jsonstr += ','+
            '"y'+(fillyear)+'_'+sem[0]+'": "'+'-'+'",'+
            '"y'+(fillyear)+'_'+sem[1]+'": "'+'-'+'",'+
            '"y'+(fillyear)+'_'+sem[2]+'": "'+'-'+'"';
        }
        jsonstr +='}';
      }
    } jsonstr += ']';
    console.log(jsonstr);
    // jsonstr = "'" + jsonstr + "'";
    var tojsonstr = JSON.parse(jsonstr);
    var errormsg = '';
    if(jsonstr=='[]') errormsg = 'NO RESULTS';
    res.render('regis',{
      student : tojsonstr,
      errormsg : errormsg
    });
  })
};

exports.record=function(req,res){
  var id = req.param('id');
  var queryinfo = 'select s.fname, s.lname, s.gender, s.sid, s.enrollYear, d.departmentName, f.facultyName from student s inner join department d on s.departmentId = d.departmentId inner join faculty f on d.facultyId = f.facultyId where s.sid = '+id;
  var queryregis = 'select * from section s inner join course c on s.courseId=c.courseId ';
  res.render('record');
};
exports.rend=function(req,res){
  var jsonstr = '[';
  pool.query('select s.sid, s.fname, s.lname, s.GPAX, a.GPA, a.year, a.term from student s left join academicrecord a on s.sid=a.sid order by s.sid, a.year, a.term asc', function(err, rows){
    if(err) console.error('QUERY ERROR : render registrar table');
    console.log('query success');
    var aobj, bobj;
    var prevID;
    var year;
    var sem=['1st','2nd','S'];
    console.log(rows.length);
    for(var i=0; i<rows.length; i++){
      aobj=rows[i];
      year=aobj.year-1;
      jsonstr += '{"sid":'+rows[i].sid+','+
        '"fname": "'+aobj.fname+'",'+
        '"lname": "'+aobj.lname+'",'+
        '"GPAX": '+aobj.GPAX+','+
          // set grade of all semester to ''-''
        '"y'+(aobj.year-year)+'_'+sem[0]+'": "'+'-'+'",'+
        '"y'+(aobj.year-year)+'_'+sem[2]+'": "'+'-'+'",'+
        '"y'+(aobj.year-year)+'_'+sem[1]+'": "'+'-'+'",'+

        '"y'+(aobj.year-year)+'_'+sem[aobj.term-1]+'": '+aobj.GPA;
      var prevyear = aobj.year;
      console.log('i='+i);
      for(var j=i+1; j<rows.length; j++){
        console.log('in if : i='+i+' j='+j);
        bobj=rows[j];
        if(aobj.sid == bobj.sid){
          if(prevyear != bobj.year){
            jsonstr += ','+
              '"y'+(bobj.year-year)+'_'+sem[0]+'": "'+'-'+'",'+
              '"y'+(bobj.year-year)+'_'+sem[1]+'": "'+'-'+'",'+
              '"y'+(bobj.year-year)+'_'+sem[2]+'": "'+'-'+'"';
            prevyear = bobj.year;
          }
          jsonstr += ','+
            '"y'+(bobj.year-year)+'_'+sem[bobj.term-1]+'": '+bobj.GPA;
        }else{
          // console.log(' in else ');
          i=j-1;
          var fillyear=rows[j-1].year-aobj.year;
          fillyear+=2;
          // console.log(' fillyear '+fillyear);
          for( fillyear; fillyear<=4; fillyear++){
            // console.log( fillyear);
            jsonstr += ','+
              '"y'+(fillyear)+'_'+sem[0]+'": "'+'-'+'",'+
              '"y'+(fillyear)+'_'+sem[1]+'": "'+'-'+'",'+
              '"y'+(fillyear)+'_'+sem[2]+'": "'+'-'+'"';
          }
          jsonstr += '},';
          break;
        }
      }
      if(i == rows.length-1 ){
        for(var fillyear=(rows[i].year-year)+1; fillyear<=4; fillyear++){
          jsonstr += ','+
            '"y'+(fillyear)+'_'+sem[0]+'": "'+'-'+'",'+
            '"y'+(fillyear)+'_'+sem[1]+'": "'+'-'+'",'+
            '"y'+(fillyear)+'_'+sem[2]+'": "'+'-'+'"';
        }
        jsonstr +='}';
      }
    } jsonstr += ']';
    console.log(jsonstr);
    // jsonstr = "'" + jsonstr + "'";
    var tojsonstr = JSON.parse(jsonstr);
    var errormsg = '';
    if(jsonstr=='[]') errormsg = 'NO RESULTS';
    res.render('regis',{
      student : tojsonstr,
      errormsg : errormsg
    });
  })
};

exports.recordPDF=function(req,res){
  pool.query('select distinct C.courseId ,E.sId,E.year,E.secId,E.grade,C.name,C.type,C.weight,S.note,STU.fname,STU.lname,STU.idNumber,STU.enrollYear,DATE_FORMAT(STU.dateOfBirth,"%b %e, %Y") as date,STU.gender,STU.email,F.FacultyName,D.departmentName, A.term,A.GPA,A.GPAX,A.CA,A.CAX,A.CGX,A.GPX,A.CG from course C,enroll E , section S , academicrecord A , student STU,faculty F,department D where C.courseId = E.courseId and S.courseId = C.courseId and E.sId = STU.sid and E.term = A.term and E.year=A.year and A.sid = E.sId and E.secId = S.secId and STU.departmentId=D.departmentId and D.facultyId=F.facultyId and STU.sid = ?',req.query.sid,function(err, results){
    if(err ) {
      console.log('QUERY ERROR : gen pdf indiv regis');
    }else{
		console.log("length : " + results.length)

		console.log(results)
		
		if(results.length == 0) {results[0] = 1;}
		
		var a = new Map();
		for(var i=0;i<results.length;i++){
			if(!a.get(results[i].year))
				a.set(results[i].year,new Map());
			if(!a.get(results[i].year).get(results[i].term))
				a.get(results[i].year).set(results[i].term,[]);
				a.get(results[i].year).get(results[i].term).push(results[i]);
		}
		
		console.log(results)

		var _data = {
			student: results[0],
			record: a
		};

		var _config = {
		  margin: {
			left: 15,
			right: 15,
			top: 15,
			bottom: 15
		  }
		};

		var filePath = "./storages/pdf/record.pdf";
		var template = __dirname + "\\..\\views\\record_pdf.jade";

		report.generate(template, filePath, _data,_config, function(err){
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
