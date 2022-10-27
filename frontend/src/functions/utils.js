const mime = require("mime")

const pluralize = (n, singular, plural, accusative) => {
	n = Math.abs(n)
	const n10 = n % 10
	const n100 = n % 100
	if (n10 === 1 && n100 !== 11) {
		return singular
	}
	if (2 <= n10 && n10 <= 4 && !(12 <= n100 && n100 <= 14)) {
		return plural
	}
	return accusative
}

const downloadFile = (url, filename) => {
	const a = document.createElement("a")
	a.href = url
	a.setAttribute("target", "_blank")
	a.setAttribute("download", filename)
	a.click()
	a.remove()
}

const numberWithSpaces = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")

const sleep = time => new Promise(r => setTimeout(r, time))

const getFileFromImageUrl = url =>
	new Promise((resolve, reject) => {
		const img = document.createElement("img")
		img.src = url
		img.setAttribute("crossorigin", "anonymous")
		img.addEventListener("load", async e => {
			try {
				const response = await fetch(url)
				const data = await response.blob()
				const extension = mime.getExtension(data.type) || "jpg"
				const canvas = document.createElement("canvas")
				canvas.width = img.width
				canvas.height = img.height
				const ctx = canvas.getContext("2d")
				ctx.drawImage(img, 0, 0)
				canvas.toBlob(
					blob => {
						resolve(
							new File([blob], `image.${extension}`, {
								type: data.type,
							})
						)
					},
					data.type,
					1
				)
			} catch (err) {
				console.error(err)
				reject("Can't load the image")
			}
		})
		img.addEventListener("error", e => {
			console.error(e)
			reject("Not an image")
		})
	})

export {pluralize, sleep, numberWithSpaces, downloadFile, getFileFromImageUrl}
