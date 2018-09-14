import * as React from 'react'
import { Component } from 'react'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { Page } from '../../ui/Page'

interface HomeState {
  navbarCollapsed: boolean
}

export class Home extends Component<{}, HomeState> {
  state: HomeState = {
    navbarCollapsed: true
  }

  toggleNavbar = () => {
    this.setState({
      navbarCollapsed: !this.state.navbarCollapsed
    })
  }

  render() {
    return (
      <Page>
        <ListGroup flush={true}>
          <ListGroupItem>
            <Link to="/games">Games</Link>
          </ListGroupItem>
          <ListGroupItem>
            <Link to="/addresses">Addresses</Link>
          </ListGroupItem>
          <ListGroupItem>
            <Link to="/friends">Friends</Link>
          </ListGroupItem>
        </ListGroup>
      </Page>
    )
  }
}
