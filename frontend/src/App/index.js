import React, {useState, useEffect, useCallback} from "react"
import useApi from "../api/useApi"
//import {useSnackbar} from "notistack"
//import UserContext from "../contexts/user"
import useDialog from "../hooks/useDialog"

import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "../components/Typography"
import Photo from "../components/Photo"
import FileUploadField from "../components/FileUploadField"
import Link from "../components/Link"
import Image from "../components/Image"
import Button from "../components/Button"
import TextField from "../components/TextField"
import AvailableSpace from "../components/AvailableSpace"
import GitHubButton from "react-github-btn"

import logo from "../images/android-chrome-192x192.png"

import styles from "./index.module.scss"
import CircularProgress from "@mui/material/CircularProgress"

const App = () => {
	const {getPhotos, getSinglePhoto} = useApi()

	/*const [user, setUser] = useState({
		id: 1,
	})*/
	const [droppedFiles, setDroppedFiles] = useState([])
	const [photos, setPhotos] = useState([])
	const [total, setTotal] = useState(0)
	const [deletedKeys, setDeletedKeys] = useState([])
	const [dialogPhotoSrc, setDialogPhotoSrc] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [link, setLink] = useState("")
	const [showLink, setShowLink] = useState(false)
	const [takenStorage, setTakenStorage] = useState(0)
	const {
		open: openPhotoDialog,
		close: closePhotoDialog,
		props: photoDialogProps,
		Component: PhotoDialog,
	} = useDialog()

	const updateLibraryInfo = useCallback(async () => {
		try {
			const {count, size} = await getPhotos({limit: 0, offset: 0})
			setTakenStorage(size)
			setTotal(count)
		} catch (err) {
			console.error(err)
		}
	}, [getPhotos])

	const onDropFiles = useCallback(files => {
		setDroppedFiles(prev => prev.concat(files))
		window.scrollTo({top: 0, behavior: "smooth"})
	}, [])

	const zoomPhoto = useCallback(
		src => {
			setDialogPhotoSrc(src)
			openPhotoDialog()
		},
		[openPhotoDialog]
	)

	const onFinish = useCallback(
		async key => {
			try {
				const photo = await getSinglePhoto({key})
				setPhotos(prev => [photo, ...prev])
				setTotal(prev => prev + 1)
				await updateLibraryInfo()
			} catch (err) {
				console.error(err)
			}
		},
		[getSinglePhoto, updateLibraryInfo]
	)

	const uploadLink = useCallback(() => {
		setLink("")
		onDropFiles([
			{
				type: "url",
				data: link,
			},
		])
	}, [link, onDropFiles])

	const onDeletePhoto = useCallback(
		async key => {
			setTotal(prev => prev - 1)
			setDeletedKeys(prev => prev.concat(key))
			await updateLibraryInfo()
		},
		[updateLibraryInfo]
	)

	useEffect(() => {
		let blockListener = false
		let hasNext = true
		let offset = 0
		const limit = 30

		const onScroll = async force => {
			const toBottom =
				document.documentElement.scrollHeight -
				(document.documentElement.scrollTop + window.innerHeight)
			if (
				(force === true && !blockListener) ||
				(toBottom < 100 && !blockListener && hasNext)
			) {
				blockListener = true
				if (offset > 0) setIsLoading(true)
				const {count, items, next, size} = await getPhotos({
					limit,
					offset,
				})
				setIsLoading(false)
				if (!items) return
				setTakenStorage(size)
				hasNext = next

				setPhotos(prev => {
					return prev.concat(
						items.filter(
							item =>
								!prev.some(
									prevItem => prevItem.key === item.key
								)
						)
					)
				})
				setTotal(count)
				blockListener = false
				offset += limit
			}
		}
		onScroll(true)

		window.addEventListener("scroll", onScroll)

		return () => window.removeEventListener("scroll", onScroll)
	}, [getPhotos])

	/*useEffect(() => {
		let timeout
		;(async function load() {
			try {
				const {count, size} = await getPhotos({limit: 0, offset: 0})
				setTakenStorage(size)
				setTotal(count)
			} catch (err) {
				console.error(err)
			}
			setTimeout(load, 5000)
		})()

		return () => clearTimeout(timeout)
	}, [getPhotos])*/

	return (
		/*<UserContext.Provider
			value={{
				user,
				setUser,
			}}
		>*/ <>
			<PhotoDialog
				{...photoDialogProps}
				maxWidth={"sm"}
				actions={[
					<Button
						key={"close"}
						variant={"primary"}
						small
						onClick={closePhotoDialog}
					>
						Close
					</Button>,
				]}
			>
				<div className={styles.imageWrapper}>
					<CircularProgress
						thickness={4}
						className={styles.progress}
					/>
					<Image src={dialogPhotoSrc} className={styles.image} />
					<Image src={dialogPhotoSrc} className={styles.blur} />
				</div>
			</PhotoDialog>

			<Container maxWidth="md" className={styles.container}>
				<div className={styles.header}>
					<Typography variant={"h4"} className={styles.mb6}>
						<img src={logo} alt={"logo"} className={styles.logo} />
						Deta Black Hole
					</Typography>
					<GitHubButton
						href="https://github.com/mikhailsdv/deta-black-hole"
						data-color-scheme="no-preference: light; light: light; dark: light;"
						data-icon="octicon-star"
						data-size="small"
						data-show-count="true"
						aria-label="Star mikhailsdv/deta-black-hole on GitHub"
					>
						Star
					</GitHubButton>
				</div>
				<Typography
					variant={"caption"}
					emphasis={"outlined"}
					component={"div"}
					className={styles.opacity08}
				>
					<Link
						to={"https://github.com/mikhailsdv/deta-black-hole"}
						underline={"hover"}
					>
						Source
					</Link>{" "}
					/{" "}
					<Link
						to={"https://github.com/mikhailsdv"}
						underline={"hover"}
					>
						Author
					</Link>{" "}
					/{" "}
					<Link
						to={"https://articles.mishasaidov.com/projects"}
						underline={"hover"}
					>
						Projects
					</Link>
				</Typography>
				<br />
				<FileUploadField
					onChange={onDropFiles}
					value={droppedFiles}
					accept="image/*"
					placeholder="Drop photos here"
					name="photos"
					onFinish={onFinish}
				/>
				<br />
				<div className={styles.linkBlock}>
					{!showLink && (
						<Typography
							variant={"subtitle2bold"}
							className={styles.orText}
							onClick={() => setShowLink(true)}
						>
							...or upload via URL
						</Typography>
					)}
					{showLink && (
						<>
							<TextField
								label="Paste an image URL"
								value={link}
								onChange={e => setLink(e.target.value)}
							/>
							<Button
								variant="primary"
								onClick={uploadLink}
								disabled={!/^https?:\/\/.+/.test(link)}
							>
								Upload
							</Button>
						</>
					)}
				</div>
				<br />
				<br />

				<div className={styles.libraryHeader}>
					<div className={styles.left}>
						<Typography variant={"h4"} className={styles.mb6}>
							Your photos
						</Typography>
						{total > 0 && (
							<Typography variant={"body1"} emphasis={"medium"}>
								There {total === 1 ? "is" : "are"} {total}{" "}
								{total === 1 ? "photo" : "photos"} in your black
								hole
							</Typography>
						)}
						{total === 0 && (
							<Typography variant={"body1"} emphasis={"medium"}>
								Your black hole is empty. Let's drop some photos
								in it!
							</Typography>
						)}
					</div>
					<div className={styles.right}>
						<AvailableSpace taken={takenStorage} />
					</div>
				</div>
				<br />
				<Grid container spacing={2}>
					{photos.map(photo =>
						deletedKeys.includes(photo.key) ? null : (
							<Grid key={photo.key} item xs={6} sm={4} md={4}>
								<Photo
									{...photo}
									id={photo.key}
									onDelete={onDeletePhoto}
									onZoom={zoomPhoto}
								/>
							</Grid>
						)
					)}
				</Grid>
				{isLoading && (
					<>
						<br />
						<br />
						<Typography
							variant={"caption"}
							emphasis={"outlined"}
							align={"center"}
							component={"div"}
						>
							Loading...
						</Typography>
					</>
				)}
			</Container>
		</>
		/*</UserContext.Provider>*/
	)
}

export default App
