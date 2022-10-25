import React, {useState, useEffect} from "react"
import Tabs from "@mui/material/Tabs"
import styles from "./index.module.scss"

const Tabs_ = props => {
	const [key, setKey] = useState(0)

	useEffect(() => {
		window.addEventListener("load", () => {
			setKey(1)
		})
	}, [])

	return <Tabs key={key} {...props} classes={styles} variant="scrollable" />
}

export default Tabs_
