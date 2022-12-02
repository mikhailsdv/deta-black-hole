import React, {useEffect, useRef, useCallback, useState} from "react"
import classnames from "classnames"
import notFoundImage from "../../images/not-found.png"
import styles from "./index.module.scss"

export default function Image(props) {
	const {
		src,
		thumbnail,
		onLoad: onLoadProp,
		transparent,
		className,
		classes = {},
		...rest
	} = props

	const [isLoaded, setLoaded] = useState(false)
	const [imageSrc, setImageSrc] = useState(thumbnail || src)
	const [isError, setIsError] = useState(false)
	const imgEl = useRef(null)

	const onLoad = useCallback(
		e => {
			setLoaded(true)
			onLoadProp && onLoadProp(e.target)
			thumbnail && setImageSrc(src)
		},
		[onLoadProp, src, thumbnail]
	)

	const onError = useCallback(e => {
		setIsError(true)
	}, [])

	useEffect(() => {
		if (thumbnail && src) {
			const img = document.createElement("img")
			img.src = src
			img.addEventListener("load", onLoad)
			img.addEventListener("error", onError)
			return () => {
				img.removeEventListener("load", onLoad)
				img.removeEventListener("error", onError)
			}
		} else {
			const img = imgEl.current
			img.addEventListener("load", onLoad)
			img.addEventListener("error", onError)
			return () => {
				img.removeEventListener("load", onLoad)
				img.removeEventListener("error", onError)
			}
		}
	}, [thumbnail, src, onLoad, onError])

	const actualSrc = isError ? notFoundImage : imageSrc

	return (
		<img
			key={actualSrc}
			alt=""
			src={actualSrc}
			ref={imgEl}
			//crossOrigin="anonymous"
			className={classnames(
				styles.root,
				className,
				classes.root,
				isLoaded && styles.loaded,
				transparent && styles.transparent
			)}
			{...rest}
		/>
	)
}
