import React from "react"
import classnames from "classnames"

import Skeleton from "@mui/material/Skeleton"

import styles from "./index.module.scss"

const Skeleton_ = props => {
	const {className, classes = {}, ...rest} = props

	return (
		<Skeleton
			variant="rect"
			animation="wave"
			className={classnames(styles.root, className, classes.root)}
			{...rest}
		></Skeleton>
	)
}

export default Skeleton_
