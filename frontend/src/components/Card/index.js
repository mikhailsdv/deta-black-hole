import React from "react"
import classnames from "classnames"

import Card from "@mui/material/Card"

import styles from "./index.module.scss"

const Card_ = props => {
	const {className, classes = {}, ...rest} = props

	return (
		<Card
			className={classnames(styles.root, className, classes.root)}
			{...rest}
		></Card>
	)
}

export default Card_
