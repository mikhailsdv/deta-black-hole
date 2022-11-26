import React, {useCallback, useMemo, useRef, useState} from "react"
import classnames from "classnames"
import urlJoin from "url-join"
import {useSnackbar} from "notistack"
import copy from "copy-to-clipboard"
import UAParser from "ua-parser-js"
import prettyBytes from "pretty-bytes"
import {
	copyBlobToClipboard,
	getBlobFromImageElement,
} from "copy-image-clipboard"
import {downloadFile} from "../../functions/utils"
import useApi from "../../api/useApi"

import Image from "../Image"
import Card from "../Card"
import Button from "../Button"
import IconButton from "../IconButton"
import Tooltip from "../Tooltip"
import DoubleClick from "../DoubleClick"
import {FlatIcon} from "../FlatIcon"

import styles from "./index.module.scss"

const parser = new UAParser()
const showCopyImageButton =
	parser.getEngine().name === "Blink" ||
	parser.getBrowser().name.includes("Chrome")

export default function Photo(props) {
	const {
		id,
		url,
		thumbnail,
		drive_name,
		file_name,
		iso_date,
		size,
		extension,
		unix_date,
		isChecked,
		onCheck,
		onDelete: onDeleteProp,
		onZoom,
		isWhiteHole,
		whiteHoleKey,
		isPublic,
		className,
		...rest
	} = props

	const src = useMemo(
		() => urlJoin(process.env.REACT_APP_API_BASE_URL, url),
		[url]
	)
	const thumbnailSrc = useMemo(
		() => urlJoin(process.env.REACT_APP_API_BASE_URL, thumbnail),
		[thumbnail]
	)
	useMemo(() => `thumbnail_${src}`, [src])
	const {enqueueSnackbar} = useSnackbar()
	const {deletePhotos, deletePhotosFromWhiteHole} = useApi()

	const [loadingCopyImage, setLoadingCopyImage] = useState(false)
	const [loadingDelete, setLoadingDelete] = useState(false)
	const clickTimer = useRef(null)
	const imgRef = useRef(null)

	const download = useCallback(() => {
		downloadFile(src, drive_name)
		enqueueSnackbar({
			variant: "default",
			message: "Downloading. Just a second...",
		})
	}, [src, drive_name, enqueueSnackbar])

	const copyUrl = useCallback(() => {
		const testUrl = urlJoin(process.env.REACT_APP_API_BASE_URL, url)
		if (/^https?:\/\//.test(testUrl)) {
			copy(testUrl)
		} else {
			copy(
				urlJoin(
					window.location.origin,
					process.env.REACT_APP_API_BASE_URL,
					url
				)
			)
		}

		enqueueSnackbar({
			variant: "success",
			message: "Direct image link copied to clipboard!",
		})
	}, [url, enqueueSnackbar])

	const copyImage = useCallback(async () => {
		try {
			setLoadingCopyImage(true)
			let img = document.createElement("img")
			img.crossOrigin = "anonymous"
			img.src = src
			img.addEventListener("load", async () => {
				const blob = await getBlobFromImageElement(img)
				await copyBlobToClipboard(blob)
				img.remove()
				img = null
				enqueueSnackbar({
					variant: "success",
					message: "Image copied to clipboard!",
				})
				setLoadingCopyImage(false)
			})
			img.addEventListener("error", e => {
				console.error(e)
				enqueueSnackbar({
					variant: "error",
					message: "Can't copy to clipboard. Try again.",
				})
				setLoadingCopyImage(false)
			})
		} catch (err) {
			console.error(err.name, err.message)
			enqueueSnackbar({
				variant: "error",
				message: "Can't copy to clipboard. Try again.",
			})
			setLoadingCopyImage(false)
		}
	}, [enqueueSnackbar, src])

	const onLoad = useCallback(img => {
		imgRef.current = img
	}, [])

	const onDelete = useCallback(async () => {
		clearTimeout(clickTimer.current)
		setLoadingDelete(true)
		const {status} = isWhiteHole
			? await deletePhotosFromWhiteHole({
					white_hole_key: whiteHoleKey,
					ids: [id],
			  })
			: await deletePhotos({ids: [id]})
		setLoadingDelete(false)
		if (status) {
			onDeleteProp(id)
			enqueueSnackbar({
				variant: "success",
				message: "Cool, deleted!",
			})
		} else {
			enqueueSnackbar({
				variant: "error",
				message: "Couldn't delete.",
			})
		}
	}, [
		isWhiteHole,
		deletePhotosFromWhiteHole,
		whiteHoleKey,
		id,
		deletePhotos,
		onDeleteProp,
		enqueueSnackbar,
	])

	return (
		<Card className={classnames(styles.root, className)} {...rest}>
			<div className={styles.imageWrapper}>
				<Image
					src={thumbnailSrc}
					className={styles.image}
					onClick={() => onZoom(src, thumbnailSrc)}
					onLoad={onLoad}
				/>
				<div className={styles.info}>
					{extension.replace(".", "").toUpperCase()}{" "}
					{prettyBytes(size).toUpperCase()}
				</div>
				{!isPublic && (
					<div
						className={classnames(
							styles.checkbox,
							isChecked && styles.checked
						)}
						onClick={onCheck}
					>
						{isChecked && <FlatIcon name={"fi-br-check"} />}
					</div>
				)}
			</div>

			<Button
				fullWidth
				variant={"primary"}
				small
				onClick={download}
				className={styles.download}
			>
				Download
			</Button>
			<div className={styles.actions}>
				{showCopyImageButton && (
					<Tooltip title={"Copy image to clipboard"}>
						<IconButton
							variant={"secondary"}
							small
							isLoading={loadingCopyImage}
							onClick={copyImage}
						>
							<FlatIcon name={"fi-br-copy-alt"} />
						</IconButton>
					</Tooltip>
				)}
				<Tooltip title={"Copy direct link to image"}>
					<IconButton variant={"secondary"} small onClick={copyUrl}>
						<FlatIcon name={"fi-br-share"} />
					</IconButton>
				</Tooltip>
				{!isPublic && (
					<DoubleClick
						onClick={onDelete}
						message="Double-click to delete this photo"
						component={"div"}
					>
						<IconButton
							variant={"secondary"}
							small
							isLoading={loadingDelete}
							fullWidth
						>
							<FlatIcon name={"fi-br-trash"} />
						</IconButton>
					</DoubleClick>
				)}
			</div>
		</Card>
	)
}
