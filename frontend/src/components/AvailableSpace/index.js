import React from "react"
import classnames from "classnames"
import prettyBytes from "pretty-bytes"

import Card from "../Card"
import Typography from "../Typography"

import styles from "./index.module.scss"

export default function AvailableSpace(props) {
	const {taken = 0, className, classes = {}, ...rest} = props
	let width = taken / 1_073_741_824
	width < 1 && (width = 1)

	return (
		<Card
			className={classnames(styles.root, className, classes.root)}
			{...rest}
		>
			<div className={styles.info}>
				<Typography
					variant={"subtitle2bold"}
					className={styles.left}
					component={"div"}
				>
					Available space
				</Typography>
				<Typography
					variant={"caption"}
					className={styles.right}
					emphasis={"medium"}
					component={"div"}
				>
					{prettyBytes(taken).replace(" ", "").toUpperCase()} / 10GB
				</Typography>
			</div>
			<div className={styles.progress}>
				<div className={styles.inner} style={{width: `${width}%`}} />
			</div>
		</Card>
	)
}
