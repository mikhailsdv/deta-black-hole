import React, {forwardRef} from "react"
import classnames from "classnames"
import {useSnackbar, SnackbarContent} from "notistack"

import {FlatIcon, createFlatIcon} from "../FlatIcon"
import Typography from "../Typography"

import styles from "./index.module.scss"

const SnackbarMessage = forwardRef((props, ref) => {
	const {closeSnackbar} = useSnackbar()
	const {
		id,
		title,
		content,
		message,
		variant,
		className,
		classes = {},
		...rest
	} = props

	const Icon =
		variant &&
		{
			success: createFlatIcon("fi-br-check"),
			default: createFlatIcon("fi-br-comment"),
			error: createFlatIcon("fi-br-exclamation"),
			warning: createFlatIcon("fi-br-exclamation"),
			santa: createFlatIcon("fi-br-tree-christmas"),
		}[variant]

	return (
		<SnackbarContent
			ref={ref}
			className={classnames(
				styles.root,
				className,
				classes.root,
				styles[variant]
			)}
			{...rest}
		>
			{message && (
				<Typography
					variant={"body1"}
					className={styles.message}
					component={"div"}
				>
					{variant && <Icon className={styles.messageIcon} />}
					{message}
				</Typography>
			)}
			<div className={styles.closeIcon} onClick={() => closeSnackbar(id)}>
				<FlatIcon name={"fi-br-cross-small"} />
			</div>
		</SnackbarContent>
	)
})

export default SnackbarMessage
