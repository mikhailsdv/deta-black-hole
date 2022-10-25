import React from "react"
import classnames from "classnames"

import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import DialogContentText from "@mui/material/DialogContentText"

//import {FlatIcon, createFlatIcon} from "../FlatIcon"

import styles from "./index.module.scss"

const Dialog_ = props => {
	const {
		title,
		text,
		/*onClose,*/ actions,
		action,
		classes,
		children,
		className,
		...rest
	} = props

	return (
		<Dialog
			classes={{
				paper: classnames(styles.paper, className),
				root: styles.root,
				...classes,
			}}
			fullWidth
			//onClose={onClose}
			{...rest}
			maxWidth="sm"
		>
			{/*<div className={styles.close} onClick={onClose}>
					<FlatIcon name={"fi-br-cross-small"} />
				</div>*/}

			{title && (
				<DialogTitle className={styles.title}>{title}</DialogTitle>
			)}
			{text && (
				<DialogContentText className={styles.text}>
					{text}
				</DialogContentText>
			)}
			{children && (
				<DialogContent className={styles.text}>
					{children}
				</DialogContent>
			)}
			{actions && <DialogActions>{actions}</DialogActions>}
			<div className={styles.action}>{action}</div>
		</Dialog>
	)
}

export default Dialog_
