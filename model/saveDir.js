
let MongoClient = require('mongodb').MongoClient
let fs = require('fs')


let connectUrl = 'mongodb://localhost:27017/test'
MongoClient.connect(connectUrl , (err, db)=>{
	if(err) console.log( err )
	console.log("     >> Connected successfully to server... ...")
	ct1 = db.collection('mzitu')
	ct1.find().sort({whichYear:-1,whichMon:-1,whichDay:-1}).toArray((err, docs)=>{
		if (err) throw(err)
		ct2 = db.collection('mziDir')
		docs.map(item=>{
			delete item.fetchUrl
			item.directory =`${item.whichYear}/${item.whichMon}/${item._id.toString()}`
			item.name = []
			item.src.map((value, index)=>{
				item.name[index] = value.split('/').pop() 
			})
			delete item.src
		})
		ct2.drop((err, reply)=>{
			if (err) throw(err)
			ct2.insertMany(docs,(err, result)=>{
				if(err) throw(err)
				db.close()
				console.log( '     >> save success' )
			})
		})
		
	})

})
