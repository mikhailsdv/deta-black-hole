import React, {useEffect, useRef, useState} from "react"

import classnames from "classnames"
import styles from "./index.module.scss"

export default function Image(props) {
	const {src, className, classes = {}, ...rest} = props

	const [isLoaded, setLoaded] = useState(false)
	const [imageSrc, setImageSrc] = useState(src)
	const [isError, setIsError] = useState(false)
	const imgEl = useRef(null)

	const onLoad = e => {
		setLoaded(true)
	}
	const onError = e => {
		setIsError(true)
	}

	useEffect(() => {
		const img = imgEl.current
		img.addEventListener("load", onLoad)
		img.addEventListener("error", onError)
		return () => {
			img.removeEventListener("load", onLoad)
			img.removeEventListener("error", onError)
		}
	}, [src])

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
