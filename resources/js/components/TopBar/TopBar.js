import React, {
  Component
} from 'react';
import Bitmaps from '../../theme/Bitmaps';

class TopBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="top-header tile-top-bar">
        <a href="/">
          <img src={Bitmaps.logo} alt="Sports logo" />
        </a>
      </div>
    )
  }
}

export default TopBar;