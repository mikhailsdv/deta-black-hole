import {useRef, useCallback, useEffect} from "react"
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
	const token = useRef(
		window.localStorage.getItem("token") ||
			window.sessionStorage.getItem("token")
	)

	useEffect(() => {
		token.current &&
			request.interceptors.request.use(config => {
				config.headers.Authorization = `Token ${token.current}`
				//config.headers.Token = token.current
				return config
			})
	}, [])

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

	const resetToken = useCallback(() => {
		window.localStorage.removeItem("token")
		window.sessionStorage.removeItem("token")
		token.current = null
		//request.defaults.headers.common.Authorization = undefined
		request.interceptors.request.use(config => {
			config.headers.Authorization = undefined
			return config
		})
	}, [])

	const setToken = useCallback(({token: tokenArg, isSession}) => {
		window[isSession ? "sessionStorage" : "localStorage"].setItem(
			"token",
			tokenArg
		)
		window[isSession ? "localStorage" : "sessionStorage"].removeItem(
			"token"
		)
		token.current = tokenArg
		request.interceptors.request.use(config => {
			config.headers.Authorization = `Token ${token.current}`
			return config
		})
	}, [])

	return {
		...endpoints.current,
		token: token.current,
		resetToken,
		setToken,
	}
}
