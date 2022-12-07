import React from "react"
import {SnackbarProvider} from "notistack"
import SnackbarMessage from "../SnackbarMessage"
import Slide from "@mui/material/Slide"

//import "./index.scss"

const SnackbarProvider_ = ({children, ...rest}) => {
	return (
		<SnackbarProvider
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "left",
			}}
			autoHideDuration={4000}
			TransitionComponent={Slide}
			content={(key, message) => (
				<SnackbarMessage id={key} {...message} />
			)}
			children={children}
			{...rest}
		/>
	)
}

export default SnackbarProvider_
