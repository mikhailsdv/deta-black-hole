import React, {useCallback, useRef} from "react"
import {useSnackbar} from "notistack"

export default function DoubleClick(props) {
	const {
		onClick,
		children,
		message,
		component: Component = "span",
		className,
		...rest
	} = props

	const {enqueueSnackbar} = useSnackbar()
	const clickTimer = useRef(null)

	const confirmAction = useCallback(
		e => {
			if (e.detail === 1) {
				clickTimer.current = setTimeout(() => {
					enqueueSnackbar({
						variant: "warning",
						message: message || "Double-click to confirm",
					})
				}, 300)
			}
		},
		[enqueueSnackbar, message]
	)

	const onConfirm = useCallback(async () => {
		clearTimeout(clickTimer.current)
		onClick()
	}, [onClick])

	return (
		<Component
			onClick={confirmAction}
			onDoubleClick={onConfirm}
			className={className}
			{...rest}
		>
			{children}
		</Component>
	)
}
