"use latest"

const MongoClient = require('mongodb').MongoClient

const hostDb = 'ds033186.mlab.com:33186/adtr-db'
const userDb = 'admin'
const passDb = 'adtr-AdmiN'
const collectionName = 'list'

function addItem(item, collection) {
	return new Promise( (resolve, reject) => {

		collection.insert(item, (err, res) => {
			if(err) reject(err)

			resolve({ok: true, msg: 'Item added'})
		})
	})
}

function getItems(collection) {
	return new Promise( (resolve, reject) => {

		const fields = {_id: 0, item: 1}
		collection.find({}, fields).toArray( (err, docs) => {
			if(err) reject(err)

			resolve(docs)
		})
	})
}

function send(res, contentType, payload) {

	const header = contentType === 'json'? {'Content-Type': 'application/json'}:
		       contentType === 'html'? {'Content-Type': 'text/html'}:
		       {'Content-Type': 'text/html'}

	res.writeHead(200, header)
	res.end(payload)
}

function htmlize(items) {

	const li = (item) => `<li>${item}</li>`

	const list = `<ul>${items.map( i => li(i.item) ).join('')}</ul>`

	return list
}


function aDayToRemember(ctx, req, res) {
	const { item, op } = ctx.data

	const mongoUri = `mongodb://${userDb}:${passDb}@${hostDb}`

	MongoClient.connect(mongoUri, (err, db) => {
		if(err) return done(err)

		const listCollection = db.collection(collectionName)

		if(!op || op === 'add')
			addItem({item}, listCollection)
			.then(result => send(res, 'json', JSON.stringify(result)) )
			.catch(err => send(res, 'json', JSON.stringify({msg: 'DB Error: Cannot add items'})) )
		else if(op === 'get')
			getItems(listCollection)
			.then( items => send(res, 'html', htmlize(items)) )
			.catch(err => send(res, 'json', JSON.stringify({msg: 'DB Error: Cannot get items'})) )

	})


}

export default aDayToRemember
