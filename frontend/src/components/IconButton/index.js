import React, {forwardRef} from "react"
import classnames from "classnames"

import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"

import styles from "./index.module.scss"

const IconButton_ = forwardRef((props, ref) => {
	const {children, small, variant, isLoading, className, ...rest} = props

	return (
		<Button
			ref={ref}
			className={classnames(
				styles.root,
				className,
				small && styles.small,
				isLoading && styles.loading,
				variant && styles[variant]
			)}
			{...rest}
		>
			{isLoading ? (
				<CircularProgress
					className={styles.preloader}
					size={20}
					thickness={4.5}
				/>
			) : (
				<span className={styles.icon}>{children}</span>
			)}
		</Button>
	)
})

export default IconButton_
