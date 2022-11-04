import React, {useState, useRef, useEffect, useCallback} from "react"
import classnames from "classnames"
import useApi from "../../api/useApi"

import Typography from "../Typography"
import Collapse from "@mui/material/Collapse"

import styles from "./index.module.scss"

export default function ExternalFile(props) {
	const {onFinish, url, className, classes = {}} = props

	const {download} = useApi()
	const int = useRef(null)

	const [progress, setProgress] = useState(0)
	const [error, setError] = useState(false)
	const [finished, setFinished] = useState(false)
	const [collapse, setCollapse] = useState(false)
	const [fadeOut, setFadeOut] = useState(false)

	const upload = useCallback(async () => {
		setError(false)
		clearInterval(int.current)
		int.current = setInterval(() => {
			setProgress(value => (value += (0.3 * (0.9 - value)) / 1))
		}, 1000)

		try {
			const {key} = await download({url})
			if (!key) {
				setError(true)
				return
			}
			clearInterval(int.current)
			setProgress(1)
			setFinished(true)
			setTimeout(() => {
				setFadeOut(true)
				setTimeout(() => {
					setCollapse(true)
					setTimeout(() => {
						onFinish(key)
					}, 500)
				}, 500)
			}, 2000)
		} catch (err) {
			console.error(err)
			setError(true)
		}
	}, [url, download, onFinish])

	useEffect(() => {
		if (progress > 0) {
			return
		}
		upload()
	}, [upload, progress])

	return (
		<Collapse in={!collapse}>
			<div
				className={classnames(
					styles.root,
					className,
					classes.root,
					fadeOut && styles.fadeOut,
					error && styles.error
				)}
			>
				<div
					className={classnames(
						styles.progress,
						progress === 1 && styles.finished
					)}
					style={{width: `${progress * 100}%`}}
				/>
				<img src={url} alt={""} className={styles.image} />
				<div className={styles.info}>
					<Typography variant={"subtitle1bold"} gutterBottom>
						{url.length > 50
							? `${url.substring(0, 47).trim()}...`
							: url}
					</Typography>
					<Typography variant={"body2"} emphasis={"medium"}>
						External file
					</Typography>
					{!error && (
						<Typography variant={"body2"} emphasis={"medium"}>
							{progress < 1
								? `Uploading: ${Math.round(progress * 100)}%`
								: finished
								? "Done!"
								: "Processing..."}
						</Typography>
					)}
					{error && (
						<Typography
							variant={"body2"}
							className={styles.tryAgain}
							onClick={upload}
						>
							Error. Click here to try again.
						</Typography>
					)}
				</div>
			</div>
		</Collapse>
	)
}
