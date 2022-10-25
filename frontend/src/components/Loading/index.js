import React, {memo} from "react"
import classnames from "classnames"

import CircularProgress from "@mui/material/CircularProgress"

import styles from "./index.module.scss"

const Loading = props => {
	const {color, value, className, classes = {}, children, ...rest} = props
	const progressStyle = color ? {color: color} : null

	return (
		<div
			{...rest}
			className={classnames(styles.root, className, classes.root)}
		>
			<CircularProgress
				style={progressStyle}
				className={styles.progress}
			/>
		</div>
	)
}

export default memo(Loading)
