import { ComponentType, SFC, ReactElement } from 'react'
import { connect, MapDispatchToProps } from 'react-redux'
import { push } from 'connected-react-router'

export type Push = () => void

type RenderFunction = (push: Push) => ReactElement<any>

interface LinkProps {
  to: string
  render: RenderFunction
}

interface LinkDispatchProps {
  push(to: string): void
}

namespace UI {
  export const Link: SFC<LinkProps & LinkDispatchProps> = ({ to, render, push }) => render(() => push(to))
}

const mapDispatchToProps: MapDispatchToProps<LinkDispatchProps, {}> = dispatch => ({
  push(to: string) {
    dispatch(push(to))
  }
})

export const Link: ComponentType<LinkProps> = connect(
  undefined,
  mapDispatchToProps
)(UI.Link)
