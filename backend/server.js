const expressApp = require("./src/index")
const port = 8080

expressApp.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})