import React, {
  Component
} from 'react';
import {
  Link
} from 'react-router-dom';
import Bitmaps from '../theme/Bitmaps';

class Auth extends Component {
  render() {
    const {
      form, header
    } = this.props;

    return (
      <div className="site-intro">
        <div className="site-intro-box">
          <div className="intro-box-content">
            <div className="brand">
              <div className="brand-logo">
                <img src={Bitmaps.logo} alt="Sports-logo" />
              </div>
            </div>
            {form}
          </div>
          <div className="intro-box-footer">
            <span>Sports, Copyright ©2020 • Privacy is </span>
            <Link to="/policy">our policy.</Link>
          </div>
        </div>
        <div className="site-intro-content">
          <div className="intro-header">
            {header}
          </div>
          <div className="intro-content">
            <img src={Bitmaps.intro} alt="Intro" />
          </div>
          <div className="intro-footer">
            <span />
          </div>
        </div>
      </div>
    );
  }
}

export default Auth;
