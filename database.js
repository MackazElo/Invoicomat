const mysql = require('mysql');

var connection = mysql.createConnection({
	host : '192.168.2.222',
	database : 'invoicomat',
	user : 'bataj_bot',
	password : 'Z9H!G/Vps1izDgJ0'
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