import axios from "axios"
import axiosRetry from "axios-retry"

const request = axios.create({
	baseURL: process.env.REACT_APP_API_BASE_URL,
	timeout: 15000,
	/*headers: {
		"Access-Control-Allow-Origin": "*",
	},*/
})

axiosRetry(request, {
	retries: 3,
	/*retryCondition: error => {
		return error.response.status === 503
	},*/
})

export default request
