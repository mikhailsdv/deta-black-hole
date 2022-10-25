import React from "react"

import Tooltip from "@mui/material/Tooltip"

import styles from "./index.module.scss"

const Tooltip_ = props => {
	return props.title ? (
		<Tooltip
			arrow
			placement="top"
			enterDelay={300}
			enterNextDelay={300}
			enterTouchDelay={0}
			leaveTouchDelay={12000}
			classes={{
				tooltip: styles.root,
				arrow: styles.arrow,
			}}
			{...props}
		/>
	) : (
		props.children
	)
}

export default Tooltip_
