import React from "react"
import classnames from "classnames"

import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import OutlinedInput from "@mui/material/OutlinedInput"
import FormHelperText from "@mui/material/FormHelperText"

import styles from "./index.module.scss"
import textFieldStyles from "../TextField/index.module.scss"
import Typography from "@mui/material/Typography"

const Select_ = props => {
	const {
		MenuProps = {},
		label,
		error,
		helperText,
		disabled,
		className,
		classes = {},
		...rest
	} = props

	const id = `id${Math.random().toString(32)}`

	return (
		<FormControl
			variant="outlined"
			className={classnames(styles.root, className, classes.root)}
			fullWidth
		>
			<InputLabel
				id={id}
				classes={{
					root: textFieldStyles.label,
					shrink: textFieldStyles.labelShrink,
					disabled: textFieldStyles.labelDisabled,
				}}
				hidden={true}
				disabled={disabled}
			>
				{label}
			</InputLabel>
			<Select
				labelId={id}
				displayEmpty
				error={error}
				classes={{
					root: classnames(styles.selectRoot, classes.selectRoot),
					disabled: styles.disabled,
				}}
				disabled={disabled}
				MenuProps={Object.assign(
					{
						classes: {
							paper: styles.menuPaper,
						},
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "center",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "center",
						},
						getContentAnchorEl: null,
					},
					MenuProps
				)}
				input={
					<OutlinedInput
						label={label}
						classes={{
							root: classnames(
								styles.InputRoot,
								classes.InputRoot
							),
							notchedOutline: styles.notchedOutline,
							focused: classnames(
								styles.focused,
								classes.focused
							),
							error: styles.error,
							disabled: styles.disabled,
							input: styles.input,
						}}
						notched={false}
						disabled={disabled}
					/>
				}
				{...rest}
			/>
			{helperText && (
				<FormHelperText
					error={error}
					data-error={error}
					classes={{root: textFieldStyles.helperText}}
				>
					<Typography variant={"subtitle2"}>{helperText}</Typography>
				</FormHelperText>
			)}
		</FormControl>
	)
}

export default Select_
