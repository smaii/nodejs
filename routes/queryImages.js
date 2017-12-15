

let express = require('express')
let formidable =require('formidable')
let fs = require('fs')
let http = require('http')
let getPixels = require("get-pixels")
let  app = express()
let mongo = require('mongodb').MongoClient 
let ObjectId = require('mongodb').ObjectID

let connectUrl = 'mongodb://localhost:27017/test'



app.use(express.static('../static'))

app.get('/', (req, res)=>{
	readHtml('../static/index.html', (data)=>{
		res.end(data)
	})
	
})

function readHtml(path , callback){

	fs.readFile(path, (err, data)=>{
		if(err) console.log( err )
		callback(data)
	});

}

app.post('/queryImages', (req, res)=>{
	console.log( 'ip:'+req.ip )
	// getIpInfo(req.ip, function(err, msg) {
	// 	console.log('城市: ' + msg.city);
	// 	// console.log('msg: ' + util.inspect(msg, true, 8));
	// })
	let  form = new formidable.IncomingForm
	form.parse(req, function(err, fields) {
		if(err) console.log( err )
		let page = parseInt(fields.page)
		let limit = parseInt(fields.num)
		console.log( 'page:'+page )
		console.log( 'limit:'+limit )
		let skip = (page-1)*limit
		queryDB(skip, limit, (data ,num)=>{
			res.json({
				status:200,
				sum: Math.ceil(num/limit),
				length:data.length,
				data:data
			})
		})
	})

})

app.post('/showImages', (req , res)=>{
	let  form = new formidable.IncomingForm
	form.parse(req, function(err, fields) {
		if(err) console.log( err )
		mongo.connect(connectUrl, (err , db)=>{
			if(err) console.log( err )
			let ct = db.collection('mziDir')
			ct.findOne({_id:ObjectId(fields._id)}, (err, item)=>{
				if(err) console.log( err )
				res.json({
					status:200,
					data:item
				})
			})
		})
	})
})


function queryDB(skip, limit, callback){
	mongo.connect(connectUrl,  (err, db)=>{
		if(err) console.log( err )
		let ct = db.collection('mziDir')
		ct.count((err, count)=>{
			if(err) throw (err)
			ct.find().skip(skip).limit(limit).toArray((err, docs)=>{
				if(err) console.log( '查询错误' )
				// let n = 0
				// docs.map((item, index)=>{
				// 	(function calcu(i){
				// 		let path ='../static/src/'+item.directory+'/'+item.name[i]
				// 		getPx(path , (w, h)=>{
				// 			if(w > h){
				// 				calcu(i+1)
				// 			}else{
				// 				docs[index].name = item.name[i]
				// 				docs[index].width = w
				// 				docs[index].height = h
				// 				n++
				// 				if(n>=limit) callback(docs, count)
				// 			}
				// 		})
				// 	})(0)
				// })
				callback(docs, count)
				
			})
		})

		
	})
}
//查询图片像素
function getPx(path, callback){
	getPixels(path, function(err, pixels) {
	if(err) {
		console.log(err)
		return getPx(path)
	}
	let width = pixels.shape[0]
	let height = pixels.shape[1]
	callback(width, height)
	})
}

app.listen(3000)

setInterval(function(){
	require('../model/fetchMzitu.js')
},1000*3600*5)

console.log( 'listen.. ... 3000' )


var getIpInfo = function(ip, cb) {
	var sina_server = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=';
	var url = sina_server + ip;
	http.get(url, function(res) {
		var code = res.statusCode;
		if (code == 200) {
			res.on('data', function(data) {
				try {
					cb(null, JSON.parse(data));
				} catch (err) {
					cb(err);
				}
			});
		} else {
			cb({ code: code });
		}
	}).on('error', function(e) { cb(e); });
}


