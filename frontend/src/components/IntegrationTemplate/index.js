import React from "react"
import classnames from "classnames"

import Image from "../Image"
import Card from "../Card"
import Typography from "../Typography"

import styles from "./index.module.scss"

export default function IntegrationTemplate(props) {
	const {id, name, image, selected, className, ...rest} = props

	return (
		<Card
			className={classnames(
				styles.root,
				className,
				selected && styles.selected
			)}
			{...rest}
		>
			<Image src={image} className={styles.image} />
			<Typography variant={"subtitle2bold"}>{name}</Typography>
		</Card>
	)
}
