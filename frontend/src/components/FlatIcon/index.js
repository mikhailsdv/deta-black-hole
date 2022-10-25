import React, {useEffect, useRef} from "react"
import classnames from "classnames"

const FlatIcon = props => {
	const {name, className, ...rest} = props
	const root = useRef(null)

	/*useEffect(() => {
		console.log(root.current, root.current.offsetWidth)
	}, [])*/

	return <i ref={root} className={classnames("fi", name, className)} />
}

const createFlatIcon = name => props => <FlatIcon name={name} {...props} />

export {FlatIcon, createFlatIcon}
