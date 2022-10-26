import React, {useEffect, useRef, useCallback, useState} from "react"

import classnames from "classnames"
import styles from "./index.module.scss"

export default function Image(props) {
	const {src, onLoad: onLoadProp, className, classes = {}, ...rest} = props

	const [isLoaded, setLoaded] = useState(false)
	const [imageSrc, setImageSrc] = useState(src)
	const [isError, setIsError] = useState(false)
	const imgEl = useRef(null)

	const onLoad = useCallback(
		e => {
			setLoaded(true)
			onLoadProp && onLoadProp(e.target)
		},
		[onLoadProp]
	)

	const onError = useCallback(e => {
		setIsError(true)
	}, [])

	useEffect(() => {
		const img = imgEl.current
		img.addEventListener("load", onLoad)
		img.addEventListener("error", onError)
		return () => {
			img.removeEventListener("load", onLoad)
			img.removeEventListener("error", onError)
		}
	}, [src, onLoad, onError])

	useEffect(() => {
		src ? setImageSrc(src) : setIsError(true)
	}, [src])

	const actualSrc = isError
		? "https://metst.ru/saransk/upload/nofound.png"
		: imageSrc

	return (
		<img
			key={actualSrc}
			alt=""
			src={actualSrc}
			ref={imgEl}
			crossOrigin="anonymous"
			className={classnames(
				styles.root,
				className,
				classes.root,
				isLoaded && styles.loaded
			)}
			{...rest}
		/>
	)
}
