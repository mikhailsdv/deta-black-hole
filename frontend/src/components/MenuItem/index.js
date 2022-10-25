import React, {forwardRef} from "react"
import classnames from "classnames"

import MenuItem from "@mui/material/MenuItem"

import styles from "./index.module.scss"

const MenuItem_ = forwardRef((props, ref) => {
	const {className, classes = {}, ...rest} = props

	return (
		<MenuItem
			ref={ref}
			{...rest}
			className={classnames(styles.root, className, classes.root)}
		/>
	)
})

export default MenuItem_
