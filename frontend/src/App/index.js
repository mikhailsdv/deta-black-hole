import React, {useState, useEffect, useCallback} from "react"
import useApi from "../api/useApi"
import copy from "copy-to-clipboard"
import {Route, Routes, Navigate, useNavigate, useMatch} from "react-router-dom"
import useDialog from "../hooks/useDialog"
import {useSnackbar} from "notistack"
import {numberWithSpaces} from "../functions/utils"
import urlJoin from "url-join"

import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "../components/Typography"
import Photo from "../components/Photo"
import FileUploadField from "../components/FileUploadField"
import Link from "../components/Link"
import Switch from "../components/Switch"
import BottomPanel from "../components/BottomPanel"
import DoubleClick from "../components/DoubleClick"
import Image from "../components/Image"
import WhiteHole from "../components/WhiteHole"
import Button from "../components/Button"
import TextField from "../components/TextField"
import IntegrationTemplate from "../components/IntegrationTemplate"
import Tabs from "../components/Tabs"
import Tab from "../components/Tab"
import AvailableSpace from "../components/AvailableSpace"
import GitHubButton from "react-github-btn"
import CircularProgress from "@mui/material/CircularProgress"
import IconButton from "../components/IconButton"
import {createFlatIcon, FlatIcon} from "../components/FlatIcon"

import logo from "../images/android-chrome-192x192.png"

import styles from "./index.module.scss"
import {Divider} from "@mui/material"

const App = () => {
	const {
		getPhotos,
		getSinglePhoto,
		createWhiteHole,
		getWhiteHoles,
		getPrivateWhiteHole,
		getPublicWhiteHole,
		deletePhotosFromWhiteHole,
		addPhotosToWhiteHole,
		deleteWhiteHole,
		deletePhotos,
		createIntegration,
		deleteIntegration,
		getIntegrations,
	} = useApi()
	const navigate = useNavigate()
	const {enqueueSnackbar} = useSnackbar()

	const privateWhiteHoleMatch = useMatch("/wh/:visibility/:id")
	const whiteHoleId = privateWhiteHoleMatch?.params?.id
	const whiteHoleVisibility = privateWhiteHoleMatch?.params?.visibility

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
	const [checkedImages, setCheckedImages] = useState([])
	const [whiteHoles, setWhiteHoles] = useState([])
	const [isPublicWhiteHole, setIsPublicWhiteHole] = useState(false)
	const [isLoadingCreateWhiteHole, setIsLoadingCreateWhiteHole] =
		useState(false)
	const [whiteHoleName, setWhiteHoleName] = useState("")
	const [totalWhiteHoles, setTotalWhiteHoles] = useState(0)
	const [whiteHole, setWhiteHole] = useState({})
	const [isLoadingDelete, setIsLoadingDelete] = useState(false)
	const [selectedWhiteHoleKey, setSelectedWhiteHoleKey] = useState(null)
	const [isLoadingAddToWhiteHole, setIsLoadingAddToWhiteHole] =
		useState(false)

	const [isLoadingCreateIntegration, setIsLoadingCreateIntegration] =
		useState(false)
	const [integrations, setIntegrations] = useState([])
	const [integrationTab, setIntegrationTab] = useState("create")
	const [integrationLink, setIntegrationLink] = useState("")
	const [integrationName, setIntegrationName] = useState("")

	const {
		open: openPhotoDialog,
		close: closePhotoDialog,
		props: photoDialogProps,
		Component: PhotoDialog,
	} = useDialog()
	const {
		open: openWhiteHoleDialog,
		close: closeWhiteHoleDialog,
		props: whiteHoleDialogProps,
		Component: WhiteHoleDialog,
	} = useDialog()
	const {
		open: openAddToWhiteHoleDialog,
		close: closeAddToWhiteHoleDialog,
		props: addToWhiteHoleDialogProps,
		Component: AddToWhiteHoleDialog,
	} = useDialog()
	const {
		open: openIntegrationDialog,
		close: closeIntegrationDialog,
		props: integrationDialogProps,
		Component: IntegrationDialog,
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

	const onCheck = useCallback(photo => {
		setCheckedImages(prev =>
			prev.includes(photo)
				? prev.filter(item => item !== photo)
				: prev.concat(photo)
		)
	}, [])

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
		async (key, file) => {
			try {
				const photo = await getSinglePhoto({key})
				setPhotos(prev => [photo, ...prev])
				setTotal(prev => prev + 1)
				setDroppedFiles(prev => prev.filter(item => item !== file))
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

	const onDeletePhotoFromWhiteHole = useCallback(async key => {
		setWhiteHole(prev => ({
			...prev,
			images: prev.images.filter(image => image.id !== key),
		}))
	}, [])

	const onDeletePhotosFromWhiteHole = useCallback(async () => {
		setIsLoadingDelete(true)
		try {
			const ids = checkedImages.map(items => items.id)
			await deletePhotosFromWhiteHole({
				ids,
				white_hole_key: whiteHoleId,
			})
			setWhiteHole(prev => ({
				...prev,
				images: prev.images.filter(
					image => !ids.some(id => image.id === id)
				),
			}))
			setCheckedImages([])
			enqueueSnackbar({
				variant: "success",
				message: "Successfully deleted!",
			})
		} catch (err) {
			console.error(err)
		}
		setIsLoadingDelete(false)
	}, [checkedImages, deletePhotosFromWhiteHole, enqueueSnackbar, whiteHoleId])

	const onOpenWhiteHoleDialog = useCallback(() => {
		setIsLoadingCreateWhiteHole(false)
		setWhiteHoleName("")
		setIsPublicWhiteHole(false)
		openWhiteHoleDialog()
	}, [openWhiteHoleDialog])

	const onOpenAddToWhiteHoleDialog = useCallback(() => {
		setIsLoadingAddToWhiteHole(false)
		openAddToWhiteHoleDialog()
	}, [openAddToWhiteHoleDialog])

	const onCreateWhiteHole = useCallback(async () => {
		setIsLoadingCreateWhiteHole(true)
		try {
			await createWhiteHole({
				images: checkedImages.map(item => item.id),
				is_public: isPublicWhiteHole,
				name: whiteHoleName.trim(),
			})
			const {items} = await getWhiteHoles({limit: 1, offset: 0})
			setWhiteHoles(prev => [items[0], ...prev])
		} catch (err) {
			console.error(err)
		}
		closeWhiteHoleDialog()
		setIsLoadingCreateWhiteHole(false)
		setCheckedImages([])
		enqueueSnackbar({
			variant: "success",
			message: "Your White Hole has been created!",
		})
	}, [
		createWhiteHole,
		closeWhiteHoleDialog,
		checkedImages,
		isPublicWhiteHole,
		whiteHoleName,
		enqueueSnackbar,
		getWhiteHoles,
	])

	const onAddToWhiteHole = useCallback(
		async key => {
			setSelectedWhiteHoleKey(key)
			setIsLoadingAddToWhiteHole(true)
			try {
				await addPhotosToWhiteHole({
					ids: checkedImages.map(item => item.id),
					white_hole_key: key,
				})
			} catch (err) {
				console.error(err)
			}
			closeWhiteHoleDialog()
			setIsLoadingAddToWhiteHole(false)
			setCheckedImages([])
			setSelectedWhiteHoleKey(null)
			closeAddToWhiteHoleDialog()
			enqueueSnackbar({
				variant: "success",
				message: "Photos have been added!",
			})
		},
		[
			closeWhiteHoleDialog,
			enqueueSnackbar,
			addPhotosToWhiteHole,
			checkedImages,
			closeAddToWhiteHoleDialog,
		]
	)

	const onDeletePhotos = useCallback(async () => {
		setIsLoadingDelete(true)
		try {
			const ids = checkedImages.map(items => items.id)
			await deletePhotos({
				ids,
			})
			setDeletedKeys(prev => prev.concat(ids))
			setCheckedImages(prev =>
				prev.filter(item => !ids.includes(item.key))
			)
			enqueueSnackbar({
				variant: "success",
				message: "Successfully deleted!",
			})
		} catch (err) {
			console.error(err)
		}
		setIsLoadingDelete(false)
	}, [checkedImages, deletePhotos, enqueueSnackbar])

	const copyWhiteHoleUrl = useCallback(() => {
		copy(window.location.href.replace("private", "public"))

		enqueueSnackbar({
			variant: "success",
			message: "White Hole public link copied to clipboard!",
		})
	}, [enqueueSnackbar])

	const onDeleteWhiteHole = useCallback(
		async key => {
			setWhiteHoles(prev => prev.filter(items => items.key !== key))
			navigate("/")
			enqueueSnackbar({
				variant: "success",
				message: "White Hole has been deleted!",
			})
			await deleteWhiteHole({key})
		},
		[deleteWhiteHole, enqueueSnackbar, navigate]
	)

	const onCreateIntegration = useCallback(async () => {
		setIsLoadingCreateIntegration(true)
		const {integration_key} = await createIntegration({
			name: integrationName,
		})
		setIntegrationLink(
			urlJoin(
				window.location.origin,
				process.env.REACT_APP_API_BASE_URL,
				"integration",
				integration_key
			)
		)
		setIsLoadingCreateIntegration(false)
	}, [createIntegration, integrationName])

	const onDeleteIntegration = useCallback(
		async key => {
			setIntegrations(prev => prev.filter(item => item.key !== key))
			await deleteIntegration({key})
		},
		[deleteIntegration]
	)

	useEffect(() => {
		if (whiteHoleVisibility === "public") return
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
	}, [getPhotos, whiteHoleVisibility])

	useEffect(() => {
		if (whiteHoleVisibility === "public" || isLoadingCreateIntegration)
			return
		;(async () => {
			const {items} = await getIntegrations()
			items.forEach(
				item =>
					(item.url = urlJoin(
						window.location.origin,
						process.env.REACT_APP_API_BASE_URL,
						"integration",
						item.key
					))
			)
			setIntegrations(items)
		})()
	}, [getIntegrations, whiteHoleVisibility, isLoadingCreateIntegration])

	useEffect(() => {
		if (whiteHoleVisibility === "public" || isLoadingCreateIntegration)
			return
		;(async function loop({limit, offset}) {
			const {count, items, next} = await getWhiteHoles({limit, offset})
			setTotalWhiteHoles(count)
			setWhiteHoles(prev =>
				prev.concat(
					items.filter(
						item =>
							!prev.some(prevItem => prevItem.key === item.key)
					)
				)
			)

			if (next) {
				offset += limit
				await loop({limit, offset})
			}
		})({limit: 20, offset: 0})
	}, [getWhiteHoles, whiteHoleVisibility, isLoadingCreateIntegration])

	useEffect(() => {
		if (whiteHoleVisibility !== "private") return
		;(async () => {
			const whiteHole = await getPrivateWhiteHole({
				key: whiteHoleId,
			})
			if (whiteHole.error) {
				return setWhiteHole({
					error: "This White Hole does not exist 😞",
				})
			}
			setWhiteHole(whiteHole)
		})()
	}, [getPrivateWhiteHole, whiteHoleId, whiteHoleVisibility])

	useEffect(() => {
		if (whiteHoleVisibility !== "public") return
		;(async () => {
			const whiteHole = await getPublicWhiteHole({
				key: whiteHoleId,
			})
			if (whiteHole.error) {
				return setWhiteHole({
					error: "This White Hole does not exist 😞",
				})
			}
			setWhiteHole(whiteHole)
		})()
	}, [
		getPrivateWhiteHole,
		getPublicWhiteHole,
		whiteHoleId,
		whiteHoleVisibility,
	])

	useEffect(() => {
		if (!whiteHoleId) {
			setWhiteHole({})
			setCheckedImages([])
		}
	}, [whiteHoleId])

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

			<AddToWhiteHoleDialog
				{...addToWhiteHoleDialogProps}
				maxWidth={"md"}
				className={styles.whiteHoleDialog}
				actions={[
					<Button
						key={"close"}
						variant={"secondary"}
						small
						onClick={closeAddToWhiteHoleDialog}
						disabled={isLoadingAddToWhiteHole}
					>
						Close
					</Button>,
				]}
			>
				<Typography variant={"h5"} gutterBottom>
					Add to White Hole
				</Typography>
				<Typography
					variant={"subtitle2"}
					emphasis={"medium"}
					component={"div"}
				>
					Choose a White Hole to add to:
				</Typography>
				<br />
				<Grid container spacing={2}>
					{whiteHoles.map(whiteHole => (
						<Grid key={whiteHole.key} item xs={12} sm={6} md={6}>
							<WhiteHole
								id={whiteHole.key}
								{...whiteHole}
								link={false}
								selected={
									selectedWhiteHoleKey === whiteHole.key
								}
								loading={selectedWhiteHoleKey === whiteHole.key}
								onClick={() => onAddToWhiteHole(whiteHole.key)}
							/>
						</Grid>
					))}
				</Grid>
				<div className={styles.whiteHoleDialogImages}>
					{checkedImages.map(image => (
						<div
							key={image.key}
							className={styles.whiteHoleImageWrapper}
						>
							<Image
								src={urlJoin(
									process.env.REACT_APP_API_BASE_URL,
									image.thumbnail
								)}
							/>
						</div>
					))}
				</div>
			</AddToWhiteHoleDialog>

			<IntegrationDialog
				{...integrationDialogProps}
				maxWidth={"md"}
				className={styles.integrationDialog}
				actions={[
					<Button
						key={"close"}
						variant={"secondary"}
						small
						onClick={closeIntegrationDialog}
						disabled={isLoadingCreateIntegration}
					>
						Close
					</Button>,
				]}
			>
				<Typography variant={"h5"} gutterBottom>
					Create an Integration
				</Typography>
				<Typography
					variant={"subtitle2"}
					emphasis={"medium"}
					component={"div"}
					gutterBottom
				>
					Integrations allow you to save images from other apps to
					your White Holes.
				</Typography>
				<Tabs
					value={integrationTab}
					onChange={(_, tab) => setIntegrationTab(tab)}
				>
					<Tab label="Create" value={"create"} />
					<Tab label="Manage" value={"manage"} />
					<Tab label="For DEVs" value={"devs"} />
				</Tabs>
				<br />
				{integrationTab === "create" && (
					<>
						{integrationLink && (
							<div className={styles.inputBlock}>
								<TextField
									label="Integration link"
									value={integrationLink}
									onClick={() => {}}
								/>
								<IconButton
									variant="primary"
									onClick={() => {
										copy(integrationLink)
										setIntegrationLink("")
										setIntegrationName("")
									}}
								>
									<FlatIcon name={"fi-br-copy-alt"} />
								</IconButton>
							</div>
						)}
						{!integrationLink && (
							<>
								<div className={styles.inputBlock}>
									<TextField
										label="Name your Integration *"
										value={integrationName}
										onChange={e =>
											setIntegrationName(e.target.value)
										}
									/>
									<Button
										variant="primary"
										onClick={onCreateIntegration}
										disabled={
											isLoadingCreateIntegration ||
											integrationName.trim().length === 0
										}
										isLoading={isLoadingCreateIntegration}
									>
										Create
									</Button>
								</div>
								<br />
								<Typography
									variant={"subtitle2bold"}
									gutterBottom
								>
									Integration templates:
								</Typography>
								<div className={styles.integrations}>
									{[
										{
											name: "Surfer",
											image: require("../images/integrations/surfer.png"),
											integrationName:
												"Saved from Surfer",
											onClick: function () {
												setIntegrationName(
													"Saved from Surfer"
												)
											},
										},
									].map(item => (
										<IntegrationTemplate
											key={item.name}
											selected={
												item.integrationName ===
												integrationName
											}
											image={item.image}
											name={item.name}
											onClick={item.onClick}
										/>
									))}
								</div>
							</>
						)}
					</>
				)}
				{integrationTab === "manage" && (
					<>
						{integrations.length === 0 && (
							<Typography
								variant={"subtitle2"}
								emphasis={"medium"}
							>
								You haven't created any Integrations yet
							</Typography>
						)}
						{integrations.map(item => (
							<div key={item.key}>
								<div className={styles.inputBlock}>
									<TextField
										label={item.name || "No name"}
										value={item.url}
										onChange={() => {}}
									/>
									<div className={styles.actions}>
										<IconButton
											variant="primary"
											onClick={() => copy(item.url)}
										>
											<FlatIcon name={"fi-br-copy-alt"} />
										</IconButton>
										<IconButton
											variant="negative"
											onClick={() =>
												onDeleteIntegration(item.key)
											}
										>
											<FlatIcon name={"fi-br-trash"} />
										</IconButton>
									</div>
								</div>
								<br />
							</div>
						))}
					</>
				)}
				{integrationTab === "devs" && (
					<>
						<Typography
							variant={"body2"}
							emphasis={"medium"}
							gutterBottom
						>
							You can save images to your White Hole using
							Integrations API. Just POST the url of an image to
							your Integration link.
						</Typography>
						<Typography variant={"body2"} emphasis={"medium"}>
							Fetch API request example:
						</Typography>
						<br />
						<code
							className={styles.code}
						>{`fetch(your_integration_url, {
    method: "POST",
    body: JSON.stringify({url: your_image_url}),
    headers: {"Content-Type": "application/json"},
)
    .then((response) => response.json())
    .then((data) => {
        const {status, error} = data;
        if (error) {
        	return alert(error)
        }
        alert("Success!")
    })`}</code>
					</>
				)}
			</IntegrationDialog>

			<WhiteHoleDialog
				{...whiteHoleDialogProps}
				maxWidth={"md"}
				className={styles.whiteHoleDialog}
				actions={[
					<Button
						key={"close"}
						variant={"secondary"}
						small
						onClick={closeWhiteHoleDialog}
						disabled={isLoadingCreateWhiteHole}
					>
						Close
					</Button>,
					<Button
						key={"create"}
						variant={"primary"}
						small
						onClick={onCreateWhiteHole}
						isLoading={isLoadingCreateWhiteHole}
						disabled={
							whiteHoleName.trim().length === 0 ||
							isLoadingCreateWhiteHole
						}
					>
						Create
					</Button>,
				]}
			>
				<Typography variant={"h5"} gutterBottom>
					Create White Hole
				</Typography>
				<Typography
					variant={"subtitle2"}
					emphasis={"medium"}
					component={"div"}
				>
					With Holes allow you to group and publicly share your
					images. Your White Holes will be listed in your Black Hole.
				</Typography>
				<br />
				<TextField
					label="Name your White Hole *"
					value={whiteHoleName}
					onChange={e => setWhiteHoleName(e.target.value)}
				/>
				<div className={styles.whiteHoleDialogImages}>
					{checkedImages.map(image => (
						<div
							key={image.key}
							className={styles.whiteHoleImageWrapper}
						>
							<Image
								src={urlJoin(
									process.env.REACT_APP_API_BASE_URL,
									image.thumbnail
								)}
							/>
						</div>
					))}
					{checkedImages.length > 15 && <Image src={""} />}
				</div>
				<div
					className={styles.visibility}
					onClick={() => setIsPublicWhiteHole(prev => !prev)}
				>
					<Typography variant={"subtitle2bold"} component={"div"}>
						Make it public
					</Typography>
					{"  "}
					<Switch onChange={() => {}} checked={isPublicWhiteHole} />
				</div>
			</WhiteHoleDialog>

			<BottomPanel
				isVisible={checkedImages.length > 0}
				className={styles.bottomPanel}
			>
				<div className={styles.actions}>
					{!whiteHoleId && (
						<Button
							variant={"primary"}
							small
							onClick={onOpenWhiteHoleDialog}
						>
							Group to White Hole
						</Button>
					)}
					{!whiteHoleId && whiteHoles.length > 0 && (
						<Button
							variant={"primary"}
							small
							onClick={onOpenAddToWhiteHoleDialog}
						>
							Add to White Hole
						</Button>
					)}
					<Button
						variant={"negative"}
						small
						onClick={() => setCheckedImages([])}
					>
						Uncheck
					</Button>

					<DoubleClick
						message={"Double-click to delete photos"}
						component={"div"}
						onClick={
							whiteHoleId
								? onDeletePhotosFromWhiteHole
								: onDeletePhotos
						}
					>
						<Button
							variant={"negative"}
							small
							isLoading={isLoadingDelete}
							loadingText={"Deleting..."}
						>
							Delete
						</Button>
					</DoubleClick>
				</div>
				<Typography
					variant={"subtitle2bold"}
					className={styles.count}
					component={"div"}
				>
					Selected:{" "}
					<Typography
						variant={"subtitle2"}
						emphasis={"medium"}
						component={"span"}
					>
						{numberWithSpaces(checkedImages.length)}
					</Typography>
				</Typography>
			</BottomPanel>

			<Container maxWidth="md" className={styles.container}>
				<div className={styles.header}>
					<Typography variant={"h4"} className={styles.mb6}>
						{whiteHoleVisibility === "public" ? (
							<Link
								external
								to={
									"https://alpha.deta.space/discovery/@mikhailsdv/black_hole-3kf"
								}
								block
								blank
							>
								<img
									src={logo}
									alt={"logo"}
									className={styles.logo}
								/>
								Deta Black Hole
							</Link>
						) : (
							<Link internal to={"/"} block>
								<img
									src={logo}
									alt={"logo"}
									className={styles.logo}
								/>
								Deta Black Hole
							</Link>
						)}
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

				<Routes>
					<Route path="/wh">
						<Route
							path=":visibility/:id"
							element={
								<>
									<br />
									<Divider className={styles.divider} />
									<br />
									{whiteHole.name && (
										<>
											<div
												className={
													styles.whiteHoleHeader
												}
											>
												<Typography variant={"h5"}>
													{whiteHole.name}
												</Typography>
												<div className={styles.actions}>
													{whiteHole.is_public && (
														<Button
															variant={"primary"}
															small
															iconAfter={createFlatIcon(
																"fi-br-share"
															)}
															onClick={
																copyWhiteHoleUrl
															}
														>
															Copy public url
														</Button>
													)}
													{whiteHoleVisibility ===
														"private" && (
														<DoubleClick
															onClick={() =>
																onDeleteWhiteHole(
																	whiteHole.key
																)
															}
															message={
																"Double-click to delete White Hole"
															}
															component={"div"}
														>
															<Button
																variant={
																	"negative"
																}
																small
																iconAfter={createFlatIcon(
																	"fi-br-trash"
																)}
															>
																Delete White
																Hole
															</Button>
														</DoubleClick>
													)}
												</div>
											</div>
											<br />
											<Grid container spacing={2}>
												{(whiteHole.images || []).map(
													photo => (
														<Grid
															key={photo.key}
															item
															xs={6}
															sm={4}
															md={4}
														>
															<Photo
																{...photo}
																id={photo.key}
																onDelete={
																	onDeletePhotoFromWhiteHole
																}
																onZoom={
																	zoomPhoto
																}
																onCheck={() =>
																	onCheck(
																		photo
																	)
																}
																isChecked={checkedImages.includes(
																	photo
																)}
																isPublic={
																	whiteHoleVisibility ===
																	"public"
																}
																isWhiteHole
																whiteHoleKey={
																	whiteHole.key
																}
															/>
														</Grid>
													)
												)}
											</Grid>
										</>
									)}
									{!whiteHole.name && (
										<Typography
											variant={"caption"}
											emphasis={"outlined"}
											align={"center"}
											component={"div"}
										>
											{whiteHole.error
												? whiteHole.error
												: "Loading..."}
										</Typography>
									)}
								</>
							}
						/>
						<Route path="*" element={<Navigate to="/" />} />
					</Route>

					<Route
						path="/"
						element={
							<>
								<Typography
									variant={"caption"}
									emphasis={"outlined"}
									component={"div"}
									className={styles.opacity08}
								>
									<Link
										to={
											"https://github.com/mikhailsdv/deta-black-hole"
										}
										underline={"hover"}
										blank
										external
									>
										Source
									</Link>{" "}
									/{" "}
									<Link
										to={"https://github.com/mikhailsdv"}
										underline={"hover"}
										blank
										external
									>
										Author
									</Link>{" "}
									/{" "}
									<Link
										to={
											"https://articles.mishasaidov.com/projects"
										}
										underline={"hover"}
										blank
										external
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
												onChange={e =>
													setLink(e.target.value)
												}
											/>
											<Button
												variant="primary"
												onClick={uploadLink}
												disabled={
													!/^https?:\/\/.+/.test(link)
												}
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
										<Typography
											variant={"h4"}
											className={styles.mb6}
										>
											Your White Holes
										</Typography>
										{totalWhiteHoles > 0 && (
											<Typography
												variant={"body1"}
												emphasis={"medium"}
											>
												There{" "}
												{totalWhiteHoles === 1
													? "is"
													: "are"}{" "}
												{totalWhiteHoles}{" "}
												{totalWhiteHoles === 1
													? "White Hole"
													: "White Holes"}{" "}
												in your Black Hole
											</Typography>
										)}
										{total === 0 && (
											<Typography
												variant={"body1"}
												emphasis={"medium"}
											>
												Your don't have any White Holes
												yet
											</Typography>
										)}
									</div>
									<div className={styles.right}>
										<Button
											variant={"primary"}
											small
											onClick={openIntegrationDialog}
										>
											Create Integration
										</Button>
									</div>
								</div>
								<br />
								<Grid container spacing={2}>
									{whiteHoles.map(whiteHole => (
										<Grid
											key={whiteHole.key}
											item
											xs={12}
											sm={6}
											md={6}
										>
											<WhiteHole
												id={whiteHole.key}
												{...whiteHole}
											/>
										</Grid>
									))}
								</Grid>
								<br />
								<br />

								<div className={styles.libraryHeader}>
									<div className={styles.left}>
										<Typography
											variant={"h4"}
											className={styles.mb6}
										>
											Your photos
										</Typography>
										{total > 0 && (
											<Typography
												variant={"body1"}
												emphasis={"medium"}
											>
												There{" "}
												{total === 1 ? "is" : "are"}{" "}
												{total}{" "}
												{total === 1
													? "photo"
													: "photos"}{" "}
												in your Black Hole
											</Typography>
										)}
										{total === 0 && (
											<Typography
												variant={"body1"}
												emphasis={"medium"}
											>
												Your Black Hole is empty. Let's
												drop some photos in it!
											</Typography>
										)}
									</div>
									<div className={styles.right}>
										<AvailableSpace
											taken={takenStorage}
											className={styles.availableSpace}
										/>
									</div>
								</div>
								<br />
								<Grid container spacing={2}>
									{photos.map(photo =>
										deletedKeys.includes(
											photo.key
										) ? null : (
											<Grid
												key={photo.key}
												item
												xs={6}
												sm={4}
												md={4}
											>
												<Photo
													{...photo}
													id={photo.key}
													onDelete={onDeletePhoto}
													onZoom={zoomPhoto}
													onCheck={() =>
														onCheck(photo)
													}
													isChecked={checkedImages.includes(
														photo
													)}
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
							</>
						}
					/>

					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</Container>
		</>
		/*</UserContext.Provider>*/
	)
}

export default App
