import React, {useCallback, useState, useEffect} from "react"
import classnames from "classnames"
import useApi from "../../api/useApi"

import Typography from "../Typography"
import Collapse from "@mui/material/Collapse"

import styles from "./index.module.scss"

export default function DroppedFile(props) {
	const {onFinish, file, className, classes = {}} = props
	const {id, name, size} = file

	const {uploadPhoto} = useApi()

	const [progress, setProgress] = useState(0)
	const [src, setSrc] = useState(
		"https://metst.ru/saransk/upload/nofound.png"
	)
	const [error, setError] = useState(false)
	const [finished, setFinished] = useState(false)
	const [collapse, setCollapse] = useState(false)
	const [fadeOut, setFadeOut] = useState(false)

	useEffect(() => {
		if (progress > 0) {
			return
		}
		setProgress(0.01)
		const fileReader = new FileReader()
		fileReader.readAsDataURL(file)
		fileReader.addEventListener("load", fileReaderEvent => {
			setSrc(fileReaderEvent.target.result)
		})
		setError(false)
		;(async () => {
			try {
				const {key} = await uploadPhoto(
					{photo: file},
					{
						onUploadProgress: ({progress}) => setProgress(progress),
					}
				)
				if (!key) {
					return setError(true)
				}
				onFinish(key)
				setFinished(true)
				setTimeout(() => {
					setFadeOut(true)
					setTimeout(() => {
						setCollapse(true)
					}, 1000)
				}, 2000)
			} catch (err) {
				console.error(err)
				setError(true)
			}
		})()
	}, [file, id, uploadPhoto, progress, onFinish])

	return (
		<Collapse in={!collapse}>
			<div
				className={classnames(
					styles.root,
					className,
					classes.root,
					fadeOut && styles.fadeOut
				)}
			>
				<div
					className={classnames(
						styles.progress,
						progress === 1 && styles.finished
					)}
					style={{width: `${progress * 90 + (finished ? 10 : 0)}%`}}
				/>
				<img src={src} alt={""} className={styles.image} />
				<div className={styles.info}>
					<Typography variant={"subtitle1bold"} gutterBottom>
						{name.length > 50
							? `${name.substring(0, 47)}...`
							: name}
					</Typography>
					<Typography variant={"body2"} emphasis={"medium"}>
						Size: {Math.floor(size / 1024 / 10) / 100} MB
					</Typography>
					<Typography variant={"body2"} emphasis={"medium"}>
						{progress < 1
							? `Uploading: ${Math.round(progress * 100)}%`
							: finished
							? "Done!"
							: "Processing..."}
					</Typography>
				</div>
			</div>
		</Collapse>
	)
}
