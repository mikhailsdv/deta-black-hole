import React from "react"

import classnames from "classnames"

import Switch from "@mui/material/Switch"

import styles from "./index.module.scss"

const Switch_ = props => {
	const {checked, className, classes = {}, ...rest} = props

	return (
		<Switch
			{...rest}
			classes={{
				root: classnames(
					styles.root,
					className,
					classes.root,
					checked ? styles.checked : styles.unchecked
				),
				track: styles.track,
				checked: styles.checked,
				thumb: styles.thumb,
				switchBase: styles.switchBase,
			}}
		/>
	)
}

export default Switch_
