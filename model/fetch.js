

let MongoClient = require('mongodb').MongoClient
let http = require('http')
let fs = require('fs')
let url = require('url')
let process = require('process')

let connectUrl = 'mongodb://localhost:27017/test'
let header = {
	        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36",
	        'referer':'http://www.mzitu.com'
	}
let ct =null
let testDB = null
//数据库文本总量
let docsCount = null
let step = 20
let skip =step-1 
MongoClient.connect(connectUrl , (err, db)=>{
	if(err) console.log( err )
	console.log("     >> Connected successfully to server... ...")
	testDB = db
	ct = db.collection('mzitu')
	ct.count((err, count)=>{
		if(err) throw (err)
		docsCount = count
		queryDB(0,step)
		console.log( count )
	})

	// ct.find().sort({whichYear:-1,whichMon:-1,whichDay:-1}).toArray((err, docs)=>{
	// 	if (err) throw(err)
	// 		console.log( docs )
	// 	// ct.drop((err, reply)=>{
	// 	// 	console.log( reply )
	// 	// 	//清空再插入排序后的数据
	// 	// 	ct.insertMany(docs)
	// 	// })

	// 	// docs.map(item=>{
	// 	// 	if(item.src.length === 0){
	// 	// 		ct.deleteOne(item,(err, result)=>{
	// 	// 			if(err) console.log( err )
	// 	// 			console.log( result )
	// 	// 		})
	// 	// 	}
	// 	// })
	// })
})

function queryDB(skip,step){
	if(skip>=docsCount) return console.log( 'success' )
	ct.find().sort({whichYear:-1,whichMon:-1,whichDay:-1}).skip(skip).limit(step).toArray((err,docs)=>{
		if(err) console.log( err )
		docs.map(item=>{
			let src = item.src
			let len = src.length
			let path_1 = '../static/src/'+item.whichYear
			let path_2 = item.whichMon
			let path_3 = item._id
			let path = path_1+'/'+path_2+'/'+path_3
			if(!fs.existsSync(path_1)) {
				fs.mkdirSync(path_1)
				fs.mkdirSync(path_1+'/'+path_2)
			}else if(!fs.existsSync(path_1+'/'+path_2)){
				fs.mkdirSync(path_1+'/'+path_2)
			}else if(!fs.existsSync(path)){
				fs.mkdirSync(path)
				downFile(path, src, 0 , len)
				return
			}else{
				// return 
			}
			downFile(path, src, 0 , len)
		})
		// console.log( docs )
	})
}

function downFile(path, urlArr, i ,num){
	//出口
	if(i>=num)  {
		skip++
		console.log( '      >>>'+path +'   =>'+'complete!!!')
		console.log( '本次更新' +(skip-step+1)+'套新图... ...' )
		return queryDB(skip,1)
	}
	let name = path+'/'+urlArr[i].split('/').pop()
	if(fs.existsSync(name)) {
		console.log( '      >>>已存在 =>'+name)
		return downFile(path,urlArr,i+1 ,num)
	}
	let opts = {
		hostname : url.parse(urlArr[i]).hostname,
		port : 80,
		path : url.parse(urlArr[i]).pathname,
		headers : header
	}
	http.get(opts,res=>{
		// console.log( 'http状态码：'+res.statusCode )
		if(res.statusCode !==200) return downFile(path,urlArr,i ,num)
		let bufferArr =[]
		
		// let str = ''
		// res.setEncoding("binary")
		res.on('data', data=>{
			bufferArr.push(data)
			// str+=data
		}).on('end',()=>{
			let bufferData = Buffer.concat(bufferArr)
			//fs.writeFile(name,str, 'binary',err =>
			fs.writeFile(name,bufferData,err =>{
				if (err) {
					// console.log( err )
					console.log('errno:   '+ err.errno )
					console.log( '     >> -------------------重新启动下载-------------------<<' )
					//Error: ENOENT: no such file or directory
					if(err.errno == '-4058') fs.mkdirSync(path)
					return downFile(path,urlArr,i ,num)
				}else{
					console.log( '      >>>正在下载'+path +'   =>'+(i+1)+'th'+'-----------程序已运行：'+process.uptime()+'s')
					return downFile(path,urlArr,i+1 ,num)
				}
			});
		})
	}).on('error', e=>{
		console.log( '     >>'+name+'   >>-------------------连接超时,重新启动下载-------------------<<' )
		return downFile(path,urlArr,i ,num)
	})
}

