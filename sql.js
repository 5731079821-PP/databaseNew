var mysql=require('mysql');
var connection=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'',
  database:'databaseproject'
});
connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connected!:)');
  }
});

var pool = mysql.createPool({
  host:'localhost',
  user:'root',
  password:'',
  database:'databaseproject',
  connectionLimit: 10
});


// module.exports=connection;
module.exports=pool;
