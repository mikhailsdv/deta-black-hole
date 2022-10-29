const path = require("path")
const sharp = require("sharp")
const {DETA_PROJECT_KEY} = require("./env")
const {Deta} = require("deta")
const deta = Deta(DETA_PROJECT_KEY)

const db = deta.Base("black-hole")
const drive = deta.Drive("black-hole")

const savePhoto = async (photo) => {
	let key
	try {
		const extension = path.extname(photo.name).toLowerCase()
		const baseItem = await db.put({
			file_name: photo.name,
			extension,
			size: photo.size,
			iso_date: new Date().toISOString(),
			unix_date: new Date().valueOf(),
			drive_name: "",
			url: "",
		})
		key = baseItem.key
		const drive_name = `${baseItem.key}${extension}`
		await db.update({
			drive_name,
			url: `/photo/${drive_name}`,
			thumbnail: `/photo/thumbnail_${drive_name}`,
		}, key)
		const driveItem = await drive.put(`${key}${extension}`, {data: photo.data})

		let thumbnail
		if (extension === ".gif") {
			thumbnail = await sharp(photo.data, {animated: true})
				.resize({width: 120, height: 120})
				.gif()
				.toBuffer()
		} else {
			thumbnail = await sharp(photo.data)
				.resize({width: 300, height: 200, fit: "cover", background: "white"})
				.jpeg({
					quality: 75,
					progressive: true,
					chromaSubsampling: "4:4:4",
				})
				.toBuffer()
		}
		await drive.put(`thumbnail_${key}${extension}`, {data: thumbnail})

		return {
			key,
		}
	} catch (err) {
		console.error(err)
		if (key) await db.delete(key)
	}
}

const getPhotos = async ({limit = 10, offset = 0}) => {
	const {count, items} = await db.fetch()
	items.sort((b, a) => a.unix_date - b.unix_date)
	const size = items.reduce((acc, item) => acc + item.size, 0)
	const sliced = items.slice(offset, offset + limit)
	sliced.forEach(item => { //backwards compatibility
		!item.thumbnail && (item.thumbnail = item.url)
	})
	return {
		count,
		items: sliced,
		size,
		next: offset + limit < count,
	}
}

const getPhotoFromBase = async ({key}) => {
	const photo = await db.get(key)
	return photo
}

const getPhoto = async ({drive_name}) => {
	const img = await drive.get(drive_name)
	if (!img) return null
	const buffer = await img.arrayBuffer()
	return Buffer.from(buffer)
}

const getThumbnail = async ({drive_name}) => {
	const thumbnail = await drive.get(`thumbnail_${drive_name}`)
	if (!thumbnail) { //backwards compatibility
		const img = await drive.get(drive_name)
		if (!img) return null
		const buffer = await img.arrayBuffer()
		return Buffer.from(buffer)
	}
	const buffer = await thumbnail.arrayBuffer()
	return Buffer.from(buffer)
}

const deletePhoto = async ({key}) => {
	try {
		const photo = await db.get(key)
		if (!photo) return true
		await db.delete(key)
		try {
			await drive.delete(photo.drive_name)
			await drive.delete(`thumbnail_${photo.drive_name}`)
		} catch (err) {
			console.error(err)
			return false
		}
		return true
	} catch (err) {
		console.error(err)
		return false
	}
}

module.exports = {
	savePhoto,
	getPhotos,
	getPhoto,
	deletePhoto,
	getPhotoFromBase,
}
