import React, { Component } from 'react';
import {
  bindActionCreators
} from 'redux';
import {
  connect
} from 'react-redux';
import {
  withRouter
} from 'react-router-dom';
import {
  Navbar, NavItem, NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import { logout } from '../../actions/common';

import Bitmaps from '../../theme/Bitmaps';

class RightNavBar extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }

  async handleLogout() {
    await this.props.logout();
    this.props.history.push('/logout');
  }

  render() {

    return (
      <Navbar className="right-nav-bar">
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav>
            <img src={Bitmaps.maleAvatar} className="table-avatar mr-2" />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem>
              <NavItem>
                <NavLink onClick={this.handleLogout}>
                  <i className="fa fa-unlock-alt" /> Log Out
                </NavLink>
              </NavItem>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        
      </Navbar>
    );
  }
}

const mapStateToProps = () => ({
});
const mapDispatchToProps = dispatch => ({
  logout: bindActionCreators(logout, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RightNavBar));
