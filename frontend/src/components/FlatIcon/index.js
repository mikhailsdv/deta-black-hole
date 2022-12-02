import React, {useRef} from "react"
import classnames from "classnames"
import styles from "./index.module.scss"

const FlatIcon = props => {
	const {name, className, ...rest} = props
	const root = useRef(null)

	return (
		<i
			ref={root}
			className={classnames("fi", name, styles.root, className)}
			{...rest}
		/>
	)
}

const createFlatIcon = name => props => <FlatIcon name={name} {...props} />

export {FlatIcon, createFlatIcon}
