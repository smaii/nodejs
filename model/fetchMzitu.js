
//爬取妹子图  并将信息存储到数据库中：

let request = require('request')
let cheerio = require('cheerio')
let express = require('express')
let assert = require('assert') //断言
let fs = require('fs')
let MongoClient = require('mongodb').MongoClient
let app = express()

let baseUrl = 'http://www.mzitu.com/all/'
let mongoUrl = 'mongodb://localhost:27017/test'
let opts = function(url){
	return {
		url:url,
		headers:{
			'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36',
			'Referer': 'http://www.mzitu.com/'
		}
	}
}


MongoClient.connect(mongoUrl, function(err, db) {
	assert.equal(null, err) //if err !==null  throw err
	console.log("     >> Connected successfully to server ...")

	queryInfo(opts(baseUrl), html=>{
		let $ = cheerio.load(html);
		//初始年 月 日
		let yearI = 0;
		let monI = 0;
		let dayI = 0;
		(function fetchYear(yearIndex){
			let year = $('ul.archives').eq(yearIndex);
			let yearLen = $('ul.archives').length;
			let whichYear = parseInt(year.prev().text());
			if( yearIndex >= yearLen ){
				console.log( '     >> 全部数据获取完毕！！！' )
				db.close()
				return
			}
			(function fetchMon(monIndex){
				let mon =  year.find('p.url').eq(monIndex)
				let monLen = year.find('p.url').length;
				let whichMon = parseInt(mon.prev().text().split('月')[0]);
				let groups = parseInt(mon.prev().text().split('( ')[1]);
				if( monIndex >= monLen ){
					fetchYear(yearIndex+1)
					return
				}
				(function fetchAlink(i){
					
					let aLen = mon.find('a').length
					let alink = mon.find('a').eq(i)
					let fetchUrl = alink.attr('href')
					let title = alink.text()
					let whichDay = parseInt(mon.text().split('\n')[i].replace(/\s+/g,'').split(':')[0]);
					//出口：
					if( i >= aLen ){
						fetchMon(monIndex+1)
						return
					}
					queryInfo(fetchUrl, fetchHtml=>{
						let $ = cheerio.load(fetchHtml)
						let num =  parseInt($('div.pagenavi a').eq(4).text())
						let docs = {
							fetchUrl:fetchUrl,
							title:title,
							whichYear:whichYear,
							whichMon:whichMon,
							groups:groups,
							whichDay:whichDay,
							num:num,
							src:[]
						}
						//先读数据库，如果已存在，则不存储
						console.log( whichDay+'/'+whichMon+'/'+whichYear+'--------------第'+(i+1)+'组' );
						// importDB(db, 'mzitu',{'fetchUrl':fetchUrl},docs,fetchAlink,i)
						(function dealData(page){
							if(page>num){
								// fetchAlink(i+1)
								 importDB(db, 'mzitu',docs,fetchAlink,i)
								return
							}
							queryDB(db,'mzitu',{'fetchUrl':fetchUrl},docs,function(){
								let url = page===1?fetchUrl : fetchUrl+'/'+page;
								queryInfo(url, html=>{
									let $ = cheerio.load(html)
									let src= $('div.main-image img').attr('src')
									if(!src){
										dealData(page+1)
										return
									}
									// let name =src.split('/').pop()
									console.log( src )
									if(docs.src.indexOf(src) == -1) docs.src.push(src);
									dealData(page+1)
								})
							},function(){
								// dealData(page+1)
								 db.close()
								 require('./saveDir.js')
								return require('./fetch.js')
							})
							
						})(1)
					})
					
				})(dayI)
				dayI = 0;
			})(monI)
			//下一圈仍然要从0开始
			monI = 0;
		})(yearI)
	})

})


function queryInfo(url, callback){
	request(url ,(error, response, body)=>{
		if(error) {
			try{
				queryInfo(url, callback)
			}catch(e){
				console.log( e )
			}
			console.log( '--------------------------------------------------------------------------------' )
		}
		if(!error && response.statusCode ===200){
			callback(body)
		}
	})
}


function importDB(db, collection,docs,callback,i){

	db.collection(collection).insertOne(docs, (err, result) => {
		assert.equal(err, null)
		console.log( docs)
		console.log('      >> Insert successfully ...')
		callback(i+1)
	})
}

function queryDB(db, collection, filter,docs,callbackA,callbackB){
	db.collection(collection).findOne(filter,(err, doc)=>{
		if(!doc){
			callbackA()
		}else{
			console.log( '     >>'+docs.title+'  已经存在' )
			callbackB()
			return console.log( '更新完毕！！！' )
		}
	})
}

