import React, {
  Component
} from 'react';
import {
  NavLink as Link
} from 'react-router-dom';
import AdminRightBar from './AdminRightBar';
import {
  Nav, NavbarBrand
} from 'reactstrap';
import Bitmaps from '../../theme/Bitmaps';

class AdminTopBar extends Component {
  constructor(props) {
    super(props);
    
    this.logout = this.logout.bind(this);
  }

  logout() {
    localStorage.clear();
  }

  render() {
    return (
      <Nav className="top-header admin-topbar">
        <NavbarBrand className="nav-logo" tag={Link} to="/admin/home">
          <img src={Bitmaps.logo} alt="Sports logo" />
          <span className="ml-4"><b>Administrator</b></span>
        </NavbarBrand>

        <AdminRightBar />
      </Nav>
    );
  }
}

export default AdminTopBar;
