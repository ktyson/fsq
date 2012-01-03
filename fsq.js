var http = require('http');  
var fs = require('fs');


http.createServer(function (req, res) {

	var url = require('url').parse(req.url, true);
	
	console.log("   requesting resource: " + url.pathname);
	
	if(url.pathname == '/fsq/fsqClient.js') {
		fs.readFile('fsq/fsqClient.js', function(error, content) {
			if (error) {
				res.writeHead(500);
				res.end();
			} else {
				res.writeHead(200, { 'Content-Type': 'text/javascript' });
				res.end(content);
			}
		});
	
	} else if(url.pathname == '/fsq/fsqStyle.css') {
		fs.readFile('fsq/fsqStyle.css', function(error, content) {
			if (error) {
				res.writeHead(500);
				res.end();
			} else {
				res.writeHead(200, { 'Content-Type': 'text/css' });
				res.end(content);
			}
		});
	
	} else {
		getContent(url, res);
	}
	

}).listen(8124, "127.0.0.1");


console.log('\n~~~\nServer running at http://127.0.0.1:8124\n');  

function getContent(urlObj, res){
	//figure out what is being requested
	var isBase = true;
	if(urlObj.pathname == '/setgo') isBase = false;
	
	
	
	var folder = '';
	if(urlObj.query.folder){
		folder = urlObj.query.folder;
	}

	if(!isBase && folder){
		//return string ajax body
		getFileObject(folder, function(qObj){
		
			//console.log(qObj);
			res.writeHead(200, {'Content-Type': 'text/json'}); 
			res.end(JSON.stringify(qObj));
		
		});
		
	}else{
		//return basic website
		var c = [];
		c.push('<html><head>');
		c.push('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>');
		c.push('<script type="text/javascript" src="fsq/fsqClient.js"></script>');
		c.push('<link rel="stylesheet" type="text/css" href="fsq/fsqStyle.css" />');
		c.push('</head><body>');
		c.push('</body></html>');
		
		res.writeHead(200, {'Content-Type': 'text/html'}); 
		res.end(c.join('\n'));
	}

}

process.on('uncaughtException', function (err) {
  console.log('   ***ProcessUncExc ' + err);
});

function getFileObject(folder, callBack){
	//take folder path and return object containing all avail info on its contents
	
	var folderQuery = {};
	folderQuery.folder = folder;
	
	fs.readdir(folder, function(err,files){
				
		folderQuery.numFiles = (files ? files.length : 0);
		var folderFiles = [];
		for(var i = 0; i < folderQuery.numFiles; i++){						
			var fo = {};
			fo.name = files[i];
			var slash = (folderQuery.folder == '/' ? '' : '/');
			var path = folderQuery.folder + slash + fo.name;
			var stats;
			try{
				stats = fs.statSync(path);
				fo.isFile = stats.isFile();
				fo.isDirectory = stats.isDirectory();
				fo.isBlockDevice = stats.isBlockDevice();
				fo.isCharacterDevice = stats.isCharacterDevice();
				fo.stats = stats;
			}catch(err){console.log('   ***Stats ' + err);err=null;}
			folderFiles.push(fo);			
		}
		
		folderQuery.files = folderFiles;
		callBack(folderQuery);
	});

}

