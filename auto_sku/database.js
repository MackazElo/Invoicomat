const mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'localhost',
	database : 'invoicomat',
	user : 'root',
	password : ''
});

connection.connect(function(error){
	if(error)
	{
		console.log(error);
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;