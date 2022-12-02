const mime = require("mime")
const axios = require("axios")
const express = require("express")
const fileUpload = require("express-fileupload")
const expressApp = express()
const {
	savePhoto,
	getPhotos,
	getPhoto,
	deletePhotos,
	getPhotoFromBase,
	getWhiteHoles,
	getWhiteHole,
	createWhiteHole,
	deleteWhiteHole,
	updateWhiteHole,
	deletePhotosFromWhiteHole,
	addPhotosToWhiteHole,
	getIntegration,
	createIntegration,
	deleteIntegration,
	getIntegrations,
	getSettings,
	setSettings,
	searchSurfer,
} = require("./db")

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
	const photos = await getPhotos({
		limit: Number(req.query.limit),
		offset: Number(req.query.offset),
	})
	res.json(photos)
})

expressApp.delete("/photos", async (req, res) => {
	const status = await deletePhotos({ids: req.body.ids})
	res.send({status})
})

expressApp.post("/photo", async (req, res) => {
	const photo = await savePhoto(req.files.photo)
	res.json(photo)
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

expressApp.post("/integration/:key", async (req, res) => {
	try {
		let photo
		if (req?.files?.photo) {
			photo = await savePhoto(req.files.photo)
		} else if (req?.body?.url) {
			const response = await axios({
				url: req.body.url,
				responseType: "arraybuffer",
				headers: {
					"user-agent":
						req.headers["user-agent"] ||
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
				},
			})
			const type =
				req.body.url.match(/^data:(.+?);/)?.[1] ||
				response.headers["content-type"] ||
				"image/jpeg"
			photo = await savePhoto({
				name: `integration.${mime.getExtension(type)}`,
				size: response.data.length,
				data: response.data,
			})
		} else {
			throw Error("No url or photo in the request")
		}
		const {white_hole_key} = await getIntegration({key: req.params.key})
		const status = await addPhotosToWhiteHole({
			white_hole_key,
			ids: [photo.key],
		})
		res.json({
			status,
			...photo,
		})
	} catch (err) {
		console.error(err)
		res.json({
			status: false,
			error: err.toString(),
		})
	}
})

expressApp.post("/integration", async (req, res) => {
	res.json(await createIntegration({name: req.body.name}))
})

expressApp.delete("/integration", async (req, res) => {
	res.json(await deleteIntegration({key: req.body.key}))
})

expressApp.get("/integration", async (req, res) => {
	res.json(await getIntegrations())
})

expressApp.post("/download", async (req, res) => {
	try {
		const response = await axios({
			url: req.body.url,
			responseType: "arraybuffer",
			headers: {
				"user-agent": req.headers["user-agent"] ||
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
			},
		})
		const type =
			req.body.url.match(/^data:(.+?);/)?.[1] ||
			response.headers["content-type"] ||
			"image/jpeg"
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

expressApp.delete("/white-hole/photos", async (req, res) => {
	const status = await deletePhotosFromWhiteHole({
		white_hole_key: req.body.white_hole_key,
		ids: req.body.ids,
	})
	res.send({status})
})

expressApp.put("/white-hole/photos", async (req, res) => {
	const status = await addPhotosToWhiteHole({
		white_hole_key: req.body.white_hole_key,
		ids: req.body.ids,
	})
	res.send({status})
})

expressApp.get("/white-hole/private/:key", async (req, res) => {
	const whiteHole = await getWhiteHole({
		key: req.params.key,
		is_public: false,
	})
	res.send(whiteHole)
})

expressApp.get("/white-hole/public/:key", async (req, res) => {
	const whiteHole = await getWhiteHole({
		key: req.params.key,
		is_public: true,
	})
	res.send(whiteHole)
})

expressApp.delete("/white-hole/:key", async (req, res) => {
	const status = await deleteWhiteHole({
		key: req.params.key,
	})
	res.send({status})
})

expressApp.post("/white-hole", async (req, res) => {
	const whiteHole = await createWhiteHole({
		images: req.body.images,
		name: req.body.name,
		is_public: req.body.is_public,
	})
	res.send(whiteHole)
})

expressApp.get("/white-holes", async (req, res) => {
	const whiteHoles = await getWhiteHoles({
		limit: Number(req.query.limit) || undefined,
		offset: Number(req.query.offset) || undefined,
	})
	res.send(whiteHoles)
})

expressApp.get("/search-surfer", async (req, res) => {
	res.send(await searchSurfer(req.query))
})

expressApp.get("/settings", async (req, res) => {
	const settings = await getSettings()
	res.send(settings)
})

expressApp.put("/settings", async (req, res) => {
	try {
		console.log(req.body)
		await setSettings({
			key: req.body.key,
			value: req.body.value,
		})
		res.send({status: true})
	} catch (err) {
		console.error(err)
		res.send({status: false})
	}
})

module.exports = expressApp
