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

module.exports = {
	pluralize,
	sleep,
	numberWithSpaces,
	downloadFile,
}
