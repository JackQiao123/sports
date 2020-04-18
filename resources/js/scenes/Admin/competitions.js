/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import { 
  Row, Col
} from 'reactstrap';

import Api from '../../apis/app';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import CompetitionTable from '../../components/CompetitionTable';


class Competitions extends Component {
  constructor(props) {
    super(props);

    this.state={
      competitions: []
    }
  }

  async componentDidMount() {
    const data = await Api.get('all-competitions');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          competitions: body.competitions
        });
        break;
      default:
        break;
    }
  }

  handleSelectItem(id) {
    this.props.history.push('/admin/competition/detail', id);
  }

  render() {
    const { competitions } = this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <h4><b>Competitions</b></h4>

            <div className="content">
              <Row>
                <Col sm="12">
                  {
                    competitions && competitions.length > 0 && (
                      <CompetitionTable
                        items={competitions}
                        is_super
                        onSelect={(this.handleSelectItem.bind(this))}
                      />
                    )
                  }
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Competitions);