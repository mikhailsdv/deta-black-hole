const path = require("path")
const {DETA_PROJECT_KEY} = require("./env")
const {Deta} = require("deta")
const deta = Deta(DETA_PROJECT_KEY)

const db = deta.Base("black-hole")
const drive = deta.Drive("black-hole")

const savePhotos = async (photos) => {
	const saved = []
	for (const photo of photos) {
		let key
		try {
			const extension = path.extname(photo.name).toLowerCase()
			const baseItem = await db.put({
				file_name: photo.name,
				extension,
				size: photo.size,
				iso_date: new Date().toISOString(),
				unix_date: new Date().valueOf(),
			})
			key = baseItem.key
			const driveItem = await drive.put(`${baseItem.key}${extension}`, {data: photo.data})
			saved.push(baseItem.key)
		} catch (err) {
			console.error(err)
			if (key) await db.delete(key)
		}
	}
	return saved
}

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
		}, key)
		const driveItem = await drive.put(`${key}${extension}`, {data: photo.data})
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
	const sliced = items.slice(offset, offset + limit)
	return {
		count,
		items: sliced,
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

const deletePhoto = async ({key}) => {
	try {
		const photo = await db.get(key)
		if (!photo) return true
		await drive.delete(photo.drive_name)
		await db.delete(key)
		return true
	} catch (err) {
		console.error(err)
		return false
	}
}

module.exports = {
	savePhotos,
	savePhoto,
	getPhotos,
	getPhoto,
	deletePhoto,
	getPhotoFromBase,
}
