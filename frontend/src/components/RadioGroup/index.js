import React from "react"
import classnames from "classnames"

import FormControl from "@mui/material/FormControl"
import FormLabel from "@mui/material/FormLabel"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import Radio from "@mui/material/Radio"
import Typography from "../Typography"

import styles from "./index.module.scss"

export default function _RadioGroup(props) {
	const {
		title,
		options,
		value,
		onChange,
		id,
		row,
		className,
		classes = {},
		...rest
	} = props

	return (
		<FormControl
			className={classnames(styles.root, classes.root, className)}
			{...rest}
		>
			{title && (
				<FormLabel id={id}>
					<Typography variant={"subtitle1bold"}>{title}</Typography>
				</FormLabel>
			)}
			<RadioGroup
				aria-labelledby={id}
				name={id}
				value={value}
				onChange={(_, value) => onChange(value)}
				className={classnames(row && styles.row)}
			>
				{options.map(option => (
					<FormControlLabel
						key={option.value}
						value={option.value}
						control={<Radio />}
						label={option.label}
						className={classnames(row && styles.mr)}
					/>
				))}
			</RadioGroup>
		</FormControl>
	)
}
