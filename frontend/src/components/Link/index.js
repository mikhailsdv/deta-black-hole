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
			data-underline={underline}
			className={classnames(
				styles.root,
				className,
				block && styles.block
			)}
			{...rest}
		>
			{children}
		</Link>
	) : (
		<a
			href={to}
			data-underline={underline}
			className={classnames(
				styles.root,
				className,
				block && styles.block
			)}
			{...aProps}
			{...rest}
		>
			{children}
		</a>
	)
}

export default Link_
