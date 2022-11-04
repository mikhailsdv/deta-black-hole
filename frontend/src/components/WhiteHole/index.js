import React from "react"
import classnames from "classnames"
import urlJoin from "url-join"

import Image from "../Image"
import Card from "../Card"
import Typography from "../Typography"
import Link from "../Link"

import styles from "./index.module.scss"

export default function WhiteHole(props) {
	const {
		id,
		name,
		link = true,
		small,
		selected,
		images,
		loading,
		is_public,
		className,
		...rest
	} = props

	const content = (
		<Card
			className={classnames(
				styles.root,
				className,
				selected && styles.selected
			)}
			{...rest}
		>
			<div className={styles.left}>
				<Typography variant={"h6"}>{name || "No name"}</Typography>
				<Typography variant={"subtitle2"} emphasis={"medium"}>
					{loading
						? "Please, wait..."
						: is_public
						? "Public"
						: "Private"}
				</Typography>
			</div>
			<div className={styles.imagesWrapper}>
				{images.map(image => (
					<Image
						key={image.key}
						src={urlJoin(
							process.env.REACT_APP_API_BASE_URL,
							image.thumbnail
						)}
						className={styles.image}
					/>
				))}
			</div>
		</Card>
	)

	return link ? (
		<Link to={`/wh/private/${id}`} block internal>
			{content}
		</Link>
	) : (
		content
	)
}
