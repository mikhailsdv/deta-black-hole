import React from "react"
import {Link} from "react-router-dom"
import classnames from "classnames"

import styles from "./index.module.scss"

const Link_ = props => {
	const {
		block,
		external,
		internal,
		to,
		blank,
		underline,
		children,
		className,
		...rest
	} = props

	const aProps = {
		//fixes warning
		target: blank ? "_blank" : "_self",
		rel: blank ? "noreferrer noopener" : "",
	}

	return internal ? (
		<Link
			to={to}
			className={classnames(
				styles.root,
				className,
				block && styles.block,
				underline && styles[`underline-${underline}`]
			)}
			{...rest}
		>
			{children}
		</Link>
	) : (
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

export default Link_
