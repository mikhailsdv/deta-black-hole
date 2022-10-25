import {useMemo} from "react"
import {useLocation} from "react-router-dom"

export default function useURLParams({parseNumeric = false} = {}) {
	const location = useLocation()

	const params = useMemo(() => {
		const result = {}
		const urlParams = new URLSearchParams(location.search)
		for (const [key, value] of urlParams.entries()) {
			if (parseNumeric) {
				result[key] = /^\d+$/.test(value) ? Number(value) : value
			} else {
				result[key] = value
			}
		}
		return result
	}, [location.search, parseNumeric])

	return params
}
