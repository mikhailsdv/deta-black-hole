import React, {useRef} from "react"
import classnames from "classnames"

const FlatIcon = props => {
	const {name, className, ...rest} = props
	const root = useRef(null)

	return (
		<i ref={root} className={classnames("fi", name, className)} {...rest} />
	)
}

const createFlatIcon = name => props => <FlatIcon name={name} {...props} />

export {FlatIcon, createFlatIcon}
