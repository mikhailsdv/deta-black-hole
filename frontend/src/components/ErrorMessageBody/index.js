import React from "react"

const ErrorMessageBody = props => {
	const {message, errors} = props

	const errorCode = JSON.stringify({
		section: window.location.pathname,
		...errors,
	})

	return (
		<>
			{message}
			<br />
			<br />
			<tt style={{lineBreak: "anywhere"}}>{errorCode}</tt>
		</>
	)
}

export default ErrorMessageBody
