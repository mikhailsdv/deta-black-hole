import React from "react"
import {SnackbarProvider} from "notistack"
import SnackbarMessage from "../SnackbarMessage"
import Slide from "@mui/material/Slide"

//import "./index.scss"

const SnackbarProvider_ = props => {
	return (
		<SnackbarProvider
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "left",
			}}
			autoHideDuration={3000}
			TransitionComponent={Slide}
			content={(key, message) => (
				<SnackbarMessage id={key} {...message} />
			)}
			{...props}
		/>
	)
}

export default SnackbarProvider_
