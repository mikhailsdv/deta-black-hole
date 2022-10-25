import React from "react"
import classnames from "classnames"

import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"

import styles from "./index.module.scss"

export default function CheckboxLabel(props) {
	const {label, checked, onChange, className, ...rest} = props

	return (
		<FormControlLabel
			checked={checked}
			control={<Checkbox />}
			label={label}
			onChange={(_, value) => onChange(value)}
			className={classnames(className, styles.root)}
		/>
	)
}
