import {useEffect, useRef} from "react"

export default function useEffectOnce(fn, deps) {
	const disabled = useRef(false)

	useEffect(() => {
		if (!disabled.current) {
			disabled.current = true
			return fn()
		}
	}, [fn, deps])
}
