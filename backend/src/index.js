const {DETA_PROJECT_KEY} = require('./env')
const express = require("express")
const fileUpload = require("express-fileupload");
const expressApp = express()
const {savePhotos, savePhoto, getPhotos, getPhoto, deletePhoto, getPhotoFromBase} = require("./db")

expressApp.use(express.json())
expressApp.use(fileUpload());

expressApp.get("/", (req, res) => {
	res.send("Hello World!")
})

expressApp.use((req, res, next) => {
	res.append('Access-Control-Allow-Origin', '*');
	res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.append('Access-Control-Allow-Headers', '*');
	next();
});

expressApp.post("/photos", async (req, res) => {
	let photos = req.files["photos[]"]
	if (!Array.isArray(photos)) {
		photos = [photos]
	}
	const items = await savePhotos(photos)
	res.json({items, count: items.length})
})

expressApp.get("/photos", async (req, res) => {
	const photos = await getPhotos({limit: Number(req.query.limit), offset: Number(req.query.offset)})
	res.json(photos)
})

expressApp.post("/photo", async (req, res) => {
	const photo = await savePhoto(req.files.photo)
	res.json(photo)
})

expressApp.delete("/photo", async (req, res) => {
	const status = await deletePhoto({key: req.body.key})
	res.send({status})
})

expressApp.get("/photo/:drive_name", async (req, res) => {
	const photo = await getPhoto({drive_name: req.params.drive_name})
	if (!photo) {
		res.status(404).json({error: "Photo not found"})
		return
	}
	res.send(photo)
})

expressApp.get("/key/:key", async (req, res) => {
	const photo = await getPhotoFromBase({key: req.params.key})
	if (!photo) {
		res.status(404).json({error: "Photo not found"})
		return
	}
	res.send(photo)
})

module.exports = expressApp
