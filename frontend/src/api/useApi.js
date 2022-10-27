import {useRef} from "react"
import request from "./request"
import endpointsJSON from "./endpoints.json"

const fillUrlParams = (url, params) => {
	for (const key in params) {
		url = url.replaceAll(`{${key}}`, params[key])
	}
	return url
	//encodeURIComponent
}

export default function useApi() {
	const endpoints = useRef(
		//проверка на совпадения урлов, параметров, отсутствия слешей и т.д.
		endpointsJSON.reduce((acc, endpoint) => {
			const {name, params, method, url, headers, ...rest} = endpoint
			acc[name] = async (args = {}, options = {}) => {
				try {
					const {data} = await request({
						url: fillUrlParams(url, args),
						method,
						[method === "get" ? "params" : "data"]:
							params &&
							params.reduce((acc, param) => {
								acc[param] = args[param]
								return acc
							}, {}),
						headers,
						...rest,
						...options,
					})

					return data
				} catch (err) {
					if (err?.response?.data) {
						return err.response.data
					} else {
						throw err
					}
				}
			}
			return acc
		}, {})
	)

	return endpoints.current
}
