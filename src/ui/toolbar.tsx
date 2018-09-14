import * as React from 'react'
import { Component } from 'react'
import { Navbar, NavbarBrand, Nav, NavItem, Collapse, NavbarToggler } from 'reactstrap'
import { SignOut } from '../app/auth/SignOut'
import { Link, Push } from '../ui/Link'

interface ToolbarState {
  collapsed: boolean
}

interface ToolbarProps {
  name: string
}

export class Toolbar extends Component<ToolbarProps, ToolbarState> {
  state: ToolbarState = {
    collapsed: true
  }

  toggleNavbar = () => {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  private navbarBrand = () => (push: Push) => (
    <NavbarBrand href="#" color="light" onClick={push} className="mr-auto">
      Home Game
    </NavbarBrand>
  )

  render() {
    return (
      <Navbar color="secondary" dark={true} expand="xxl">
        <Link to="/" render={this.navbarBrand()} />
        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
        <Collapse isOpen={!this.state.collapsed} navbar={true}>
          <Nav navbar={true}>
            <NavItem>
              <SignOut />
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}
