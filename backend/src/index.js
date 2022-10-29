const {DETA_PROJECT_KEY} = require("./env")
const mime = require("mime")
const axios = require("axios")
const express = require("express")
const fileUpload = require("express-fileupload")
const expressApp = express()
const {savePhoto, getPhotos, getPhoto, deletePhoto, getPhotoFromBase} = require("./db")

expressApp.use(express.json())
expressApp.use(fileUpload())

expressApp.get("/", (req, res) => {
	res.send("Hello World!")
})

expressApp.use((req, res, next) => {
	res.append("Access-Control-Allow-Origin", "*")
	res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
	res.append("Access-Control-Allow-Headers", "*")
	next()
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
	res.set("Content-Type", mime.getType(req.params.drive_name))
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

expressApp.post("/download", async (req, res) => {
	try {
		const response = await axios({
			url: req.body.url,
			responseType: "arraybuffer",
			headers: {
				"user-agent": req.headers["user-agent"],
			},
		})
		const type = req.body.url.match(/^data:(.+?);/)?.[1] || response.headers['content-type'] || "image/jpeg"
		const photo = await savePhoto({
			name: `download.${mime.getExtension(type)}`,
			size: response.data.length,
			data: response.data,
		})
		res.json(photo)
	} catch (err) {
		console.error(err)
		res.status(400).json({error: "Can't download photo"})
	}
})

module.exports = expressApp
