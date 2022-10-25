import React from "react"
import classnames from "classnames"

import Checkbox from "@material-ui/core/Checkbox"

import CheckboxUnchecked from "icons/CheckboxUnchecked"
import CheckboxUncheckedDisabled from "icons/CheckboxUncheckedDisabled"
import CheckboxChecked from "icons/CheckboxChecked"
import CheckboxCheckedDisabled from "icons/CheckboxCheckedDisabled"

import styles from "./index.module.scss"

const Checkbox_ = props => {
	const {disabled, color, className, ...rest} = props

	return (
		<Checkbox
			color="primary"
			classes={{disabled: styles.disabled}}
			className={classnames(styles.root, className)}
			icon={
				disabled ? <CheckboxUncheckedDisabled /> : <CheckboxUnchecked />
			}
			checkedIcon={
				disabled ? (
					<CheckboxCheckedDisabled />
				) : (
					<CheckboxChecked color={color} />
				)
			}
			disabled={disabled}
			{...rest}
		/>
	)
}

export default Checkbox_
