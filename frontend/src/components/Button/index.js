import React from "react"
import classnames from "classnames"

import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"

import styles from "./index.module.scss"

const Button_ = props => {
	const {
		fullWidth,
		small,
		tiny,
		loadingText,
		children,
		iconAfter: IconAfter,
		iconBefore: IconBefore,
		variant,
		isLoading,
		className,
		...rest
	} = props

	return (
		<Button
			className={classnames(
				styles.root,
				className,
				small && styles.small,
				tiny && styles.tiny,
				fullWidth && styles.fullWidth,
				isLoading && styles.loading,
				variant && styles[variant]
			)}
			disableElevation
			{...rest}
		>
			{IconBefore && <IconBefore className={styles.iconBefore} />}
			{!loadingText && (
				<CircularProgress
					className={styles.preloader}
					size={20}
					thickness={4.5}
				/>
			)}
			<Typography
				variant="button"
				className={classnames(
					styles.label,
					loadingText && isLoading && styles.pulse
				)}
			>
				{loadingText ? (isLoading ? loadingText : children) : children}
			</Typography>
			{!(loadingText && isLoading) && IconAfter && (
				<IconAfter className={styles.iconAfter} />
			)}
		</Button>
	)
}

export default Button_
