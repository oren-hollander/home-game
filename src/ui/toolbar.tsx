import * as React from 'react'
import { Component } from 'react'
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Collapse, NavbarToggler } from 'reactstrap'
import { SignOut } from '../app/auth/SignOut'
import { map } from 'lodash/fp'
import { Link, Push } from '../ui/Link'

interface Page {
  title: string,
  path: string
}

interface ToolbarProps {
  path: ReadonlyArray<Page>
}

interface ToolbarState {
  collapsed: boolean
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

  navLink = (text: string) => (push: Push) => 
    <NavLink onClick={push}>
      {text}
    </NavLink>

  render() {
    return (
      <Navbar color="secondary" dark={true} expand="sm">
        <NavbarBrand href="#" className="mr-auto">Home Game</NavbarBrand>
        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
        <Collapse isOpen={!this.state.collapsed} navbar={true}>
          <Nav navbar={true}>
            <NavItem>
              <SignOut />
            </NavItem>
          </Nav>
          {
            map(page => (
              <Nav navbar={true} key={page.title}>
                <NavItem>
                  <Link to={page.path} render={this.navLink(page.title)}/>
                </NavItem>
              </Nav>
            ), this.props.path)
          }
        </Collapse>
      </Navbar>
    )
  }
}