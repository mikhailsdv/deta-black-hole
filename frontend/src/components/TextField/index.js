import React, {useCallback, useRef, useState} from "react"
import {IMaskInput} from "react-imask"
import classnames from "classnames"

import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import styles from "./index.module.scss"

const TextField_ = props => {
	const {
		error,
		helperText,
		icon: Icon,
		maskProps,
		className,
		classes = {},
		children,
		...rest
	} = props

	const [isFocused, setIsFocused] = useState(false)

	const onFocus = useCallback(() => {
		setIsFocused(true)
	}, [])
	const onBlur = useCallback(() => {
		setIsFocused(false)
	}, [])

	const InputProps = useRef(
		(() => {
			const value = {classes: {root: styles.Input, input: styles.input}}
			if (maskProps) {
				value.inputComponent = props => {
					const {inputRef, ...other} = props
					return (
						<IMaskInput
							{...other}
							{...maskProps}
							inputRef={inputRef}
							//onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
						/>
					)
				}
			}
			return value
		})(),
		[maskProps]
	)

	return (
		<div className={styles.wrapper}>
			<div
				className={classnames(
					styles.root,
					className,
					classes.root,
					isFocused && styles.isFocused
				)}
				data-focused={isFocused}
				data-error={error}
			>
				{Icon && <Icon className={styles.icon} />}
				<TextField
					fullWidth
					variant="filled"
					onFocus={onFocus}
					onBlur={onBlur}
					InputProps={InputProps.current}
					InputLabelProps={{
						classes: {
							root: styles.label,
							shrink: styles.labelShrink,
						},
					}}
					inputProps={{className: styles.input}}
					{...rest}
				/>
			</div>
			{helperText && (
				<Typography
					variant={"subtitle2"}
					className={classnames(
						styles.helperText,
						error && styles.error
					)}
				>
					{helperText}
				</Typography>
			)}
		</div>
	)
}

export default TextField_
