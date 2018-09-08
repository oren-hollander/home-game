import * as React from 'react'
import { SFC } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../../ui/Page'
import { Jumbotron } from 'reactstrap'

export const AddressRequired: SFC = () =>
  <Page>
    <Jumbotron>
      <p>You must have an address to be able to create games</p>
      <Link to='/addresses/new'>Create Address</Link>
    </Jumbotron>
  </Page>