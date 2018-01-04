const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
    sendFile(res, './bundle/bundle.js')
}).listen(1025);


function sendFile(res,path){
	// var path = process.cwd()+path;
	fs.readFile(path,function(err,stdout,stderr){
        console.log(err);
		if(!err){
			var data = stdout;
			res.writeHead(200,{'Content-type':"text/javascript"});	//在这里设置文件类型，告诉浏览器解析方式
			res.write(data);
		}
		res.end();
	})
}