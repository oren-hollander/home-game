import * as React from 'react'
import {SFC} from 'react'
import {Link} from 'react-router-dom'

export const AddressRequired: SFC = () =>
  <div>
    You must have an address to be able to create games
    <Link to='/address'><button type="button">Edit Address</button></Link>
  </div>