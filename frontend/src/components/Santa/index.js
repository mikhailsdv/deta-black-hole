import React, {useState, useEffect, useCallback} from "react"
import classnames from "classnames"
import {useSnackbar} from "notistack"
import {arrayRandom} from "../../functions/utils"

import santaImage from "./santa.png"

import styles from "./index.module.scss"

export default function Santa() {
	const {enqueueSnackbar} = useSnackbar()

	const [side, setSide] = useState("")
	const [top, setTop] = useState(100)

	const onClick = useCallback(() => {
		const phrases = [
			"Happy New Year! 💥!",
			"You didn't see me! 🤫",
			"You behaved well this year, right? 🤔?",
			"Why don't you write me letters anymore?  🙁",
			"They told me you don't believe in me, is that true? 😢",
			"Catch me if you can 🙈",
			"I climbed up the chimney and fell into a black hole 😜",
			"Can you take a screenshot of me? 😊",
		]
		enqueueSnackbar({
			variant: "santa",
			message: arrayRandom(phrases),
		})
	}, [enqueueSnackbar])

	useEffect(() => {
		let t
		;(function loop() {
			setSide([styles.right, styles.left][Math.round(Math.random())])
			setTop(
				Math.round(
					54 + Math.random() * (window.innerHeight - 54 - 54 - 144)
				)
			)
			setTimeout(() => {
				setSide("")
			}, 2000)
			t = setTimeout(loop, 15000)
		})()

		return () => clearTimeout(t)
	}, [])

	return (
		<img
			alt="santa"
			onClick={onClick}
			className={classnames(styles.root, side)}
			style={{top: `${top}px`}}
			src={santaImage}
		/>
	)
}
