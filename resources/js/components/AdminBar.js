import React, {
  Component
} from 'react';
import {
  withRouter, NavLink as Link
} from 'react-router-dom';
import { Nav, Navbar, NavItem, NavLink } from 'reactstrap';

class AdminBar extends Component {
  constructor(props) {
    super(props);
    
    this.logout = this.logout.bind(this);
  }

  logout() {
    localStorage.clear();
  }

  render() {

    return (
      <div className="admin-sidebar">
        <Nav>
          <Navbar>
            <NavItem>
              <NavLink tag={Link} to="/admin/home">
                <i className="mr-2 fa fa-home"></i> Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/admin/create">
                <i className="mr-2 fa fa-file"></i> Create New Federation
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/admin/federations">
                <i className="mr-2 fa fa-search"></i> Search Federations
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/admin/competitions">
                <i className="mr-2 fa fa-users"></i> Competitions
              </NavLink>
            </NavItem>
          </Navbar>
        </Nav>
      </div>
    );
  }
}

export default withRouter(AdminBar);