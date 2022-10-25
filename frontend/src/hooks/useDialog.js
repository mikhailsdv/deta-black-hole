import {useState, useCallback, useMemo} from "react"

import Dialog from "../components/Dialog"

export default function useDialog() {
	const [isOpen, setIsOpen] = useState(false)

	const open = useCallback(() => {
		setIsOpen(true)
	}, [])

	const close = useCallback(() => {
		setIsOpen(false)
	}, [])

	const props = useMemo(
		() => ({
			open: isOpen,
			onClose: close,
		}),
		[isOpen, close]
	)

	return {open, close, props, Component: Dialog}
}
