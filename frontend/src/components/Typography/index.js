import React from "react"
import classnames from "classnames"

import Typography from "@mui/material/Typography"

import styles from "./index.module.scss"

export default function _Typography(props) {
	const {emphasis = "high", className, classes = {}, ...rest} = props

	return (
		<Typography
			className={classnames(styles.root, className, styles[emphasis])}
			{...rest}
		/>
	)
}
