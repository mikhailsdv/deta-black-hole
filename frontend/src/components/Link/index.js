import React from "react"
import classnames from "classnames"

import styles from "./index.module.scss"

export default function Link(props) {
	const {
		block,
		to,
		targetBlank = true,
		underline,
		children,
		className,
		...rest
	} = props

	const aProps = {
		//fixes warning
		target: targetBlank ? "_blank" : "_self",
		rel: targetBlank ? "noreferrer noopener" : "",
	}

	return (
		<a
			href={to}
			className={classnames(
				styles.root,
				className,
				block && styles.block,
				underline && styles[`underline-${underline}`]
			)}
			{...aProps}
			{...rest}
		>
			{children}
		</a>
	)
}
