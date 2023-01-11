import React, {useCallback, useEffect, useRef, useState} from "react"
import classnames from "classnames"
import useApi from "../../api/useApi"
import useDialog from "../../hooks/useDialog"
import {useSnackbar} from "notistack"

import TextField from "../TextField"
import Typography from "../Typography"
import Card from "../Card"
import Link from "../Link"
import Image from "../Image"
import {FlatIcon} from "../FlatIcon"
import Collapse from "@mui/material/Collapse"
import Grid from "@mui/material/Grid"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import CircularProgress from "@mui/material/CircularProgress"

import surferLogoImage from "../../images/integrations/surfer.png"

import styles from "./index.module.scss"
import Button from "../Button"

export default function SurferSearch(props) {
	const {onSave, className, classes = {}, ...rest} = props
	const {searchSurfer, getSettings, setSettings} = useApi()
	const {enqueueSnackbar} = useSnackbar()

	const [render, setRender] = useState(false)
	const [images, setImages] = useState([])
	const [query, setQuery] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	const [surferHost, setSurferHost] = useState("")
	const [surferApiKey, setSurferApiKey] = useState("")
	const [isConnecting, setIsConnecting] = useState(false)

	const settings = useRef({})
	const queryTrim = query.trim()

	const {
		open: openDialog,
		close: closeDialog,
		props: dialogProps,
		Component: Dialog,
	} = useDialog()

	const search = useCallback(
		async e => {
			e && e.preventDefault()
			if (isLoading) return
			if (
				!settings.current.surfer_host ||
				!settings.current.surfer_api_key
			) {
				return openDialog()
			}
			if (queryTrim === "") {
				setImages([])
				setIsLoading(false)
				return
			}
			setIsLoading(true)
			try {
				const {items} = await searchSurfer({
					query: queryTrim,
					results: 12,
				})
				if (!items) throw new Error("Invalid items")
				setImages(items)
			} catch (err) {
				console.error(err)
				setImages([])
				enqueueSnackbar({
					variant: "error",
					message: (
						<>
							Couldn't search.{" "}
							<a href={"#"} onClick={openDialog}>
								Click here
							</a>{" "}
							to update your Surfer settings.
						</>
					),
				})
			}
			setIsLoading(false)
		},
		[enqueueSnackbar, openDialog, queryTrim, searchSurfer, isLoading]
	)

	const clear = useCallback(() => {
		setImages([])
		setIsLoading(false)
		setQuery("")
		document.getElementById("surfer-input").focus()
		setTimeout(() => {})
	}, [])

	const onFocus = useCallback(
		e => {
			if (
				!settings.current.surfer_host ||
				!settings.current.surfer_api_key
			) {
				openDialog()
				e.target.blur()
			}
		},
		[openDialog]
	)

	const save = useCallback(
		image => {
			onSave({
				type: "url",
				data: image.image,
			})
		},
		[onSave]
	)

	const connect = useCallback(async () => {
		const surferHostTrim = surferHost
			.trim()
			.replace(/^https?:\/\//g, "")
			.replace(/\//g, "")
		const surferApiKeyTrim = surferApiKey.trim()
		if (surferHostTrim === "" || surferApiKeyTrim === "") return

		setIsConnecting(true)
		try {
			const {status: s0} = await setSettings({
				key: "surfer_host",
				value: surferHostTrim,
			})
			const {status: s1} = await setSettings({
				key: "surfer_api_key",
				value: surferApiKeyTrim,
			})
			if (!s0 || !s1) {
				throw Error("Settings was not saved")
			}
			settings.current = {
				surfer_api_key: surferApiKeyTrim,
				surfer_host: surferHostTrim,
			}
			closeDialog()
			enqueueSnackbar({
				variant: "success",
				message: "Surfer successfully connected!",
			})
		} catch (err) {
			console.error(err)
			enqueueSnackbar({
				variant: "error",
				message: "Error occurred. Try again later.",
			})
		}
		setIsConnecting(false)
	}, [closeDialog, enqueueSnackbar, setSettings, surferHost, surferApiKey])

	useEffect(() => {
		if (queryTrim === "") {
			setImages([])
			setIsLoading(false)
		}
	}, [queryTrim])

	useEffect(() => {
		;(async () => {
			settings.current = await getSettings()
			setRender(true)
		})()
	}, [getSettings])

	return render ? (
		<>
			<Dialog
				{...dialogProps}
				maxWidth={"md"}
				//className={styles.whiteHoleDialog}
				actions={[
					<Button
						key={"close"}
						variant={"secondary"}
						small
						onClick={closeDialog}
						disabled={isConnecting}
					>
						Close
					</Button>,
					<Button
						key={"save"}
						variant={"primary"}
						small
						onClick={connect}
						disabled={isConnecting}
						isLoading={isConnecting}
					>
						Save
					</Button>,
				]}
			>
				<Typography variant={"h5"} gutterBottom>
					Connect Surfer
				</Typography>
				<Typography
					variant={"subtitle2"}
					emphasis={"medium"}
					component={"div"}
				>
					This is one-time action. Then you'll be able to use Surfer
					from your Black Hole.
				</Typography>
				<br />
				<Typography
					variant={"subtitle2"}
					emphasis={"outlined"}
					component={"div"}
					gutterBottom
				>
					1. Open your Canvas
					<br />
					2. Click to the three dots on the Surfer app
					<br />
					3. Go to Settings
					<br />
					4. Go to API Keys tab
					<br />
					5. Create new API key
					<br />
					6. Paste it in the field below
				</Typography>
				<TextField
					label={"Your Surfer Space API key"}
					value={surferApiKey}
					onChange={e => setSurferApiKey(e.target.value)}
				/>
				<br />
				<Typography
					variant={"subtitle2"}
					emphasis={"outlined"}
					component={"div"}
					gutterBottom
				>
					1. Open Surfer from your Canvas
					<br />
					2. Copy the url from the address bar
					<br />
					3. Paste it in the field below
				</Typography>
				<TextField
					label={"Your Surfer host"}
					value={surferHost}
					onChange={e => setSurferHost(e.target.value)}
				/>
			</Dialog>

			<div
				className={classnames(styles.root, className, classes.root)}
				{...rest}
			>
				<form onSubmit={search} className={styles.searchWrapper}>
					<TextField
						id={"surfer-input"}
						label={"Search in Surfer"}
						value={query}
						onFocus={onFocus}
						onChange={e => setQuery(e.target.value)}
						InputProps={{
							endAdornment:
								query.length > 0 ? (
									<InputAdornment position="end">
										<IconButton
											aria-label="clear input"
											onClick={clear}
										>
											<FlatIcon
												name={"fi-br-cross-small"}
												className={styles.clear}
											/>
										</IconButton>
									</InputAdornment>
								) : null,
						}}
					/>
					<button type="submit" className={styles.searchButton}>
						{isLoading ? (
							<CircularProgress
								size={26}
								thickness={4}
								className={styles.progress}
							/>
						) : (
							<img src={surferLogoImage} alt={"surfer logo"} />
						)}
					</button>
				</form>
				<Collapse in={Boolean(images.length)}>
					<Card className={styles.images}>
						<Typography
							variant={"subtitle2"}
							className={styles.credits}
							emphasis={"outlined"}
						>
							API provided by{" "}
							<Link
								external
								blank
								to={
									"https://alpha.deta.space/discovery/@sofa/surfer-uwm"
								}
								underline={"always"}
							>
								Surfer
							</Link>
						</Typography>
						<Grid container spacing={1}>
							{images.map(image => (
								<Grid
									key={image.image}
									item
									xs={4}
									sm={3}
									md={3}
								>
									<div
										className={styles.imageWrapper}
										onClick={() => save(image)}
									>
										<div className={styles.clickToSave}>
											<Typography
												variant={"subtitle2bold"}
												emphasis={"medium"}
											>
												Click to save
											</Typography>
										</div>
										<Image
											className={styles.image}
											alt={image.title}
											title={image.title}
											src={image.image}
											thumbnail={image.thumbnail}
										/>
									</div>
								</Grid>
							))}
						</Grid>
					</Card>
				</Collapse>
			</div>
		</>
	) : null
}
