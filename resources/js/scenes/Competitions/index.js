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
  Container, Row, Col
} from 'reactstrap';

import Api from '../../apis/app';

import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionTable from '../../components/CompetitionTable';

class Competitions extends Component {
  constructor(props) {
    super(props);

    this.state={
      year: [],
      years: [],
      competitions: [],
      init_comps: []
    };
  }

  async componentDidMount() {
    let d = new Date();
    let n = d.getFullYear();

    let years = [];

    for (var i = n + 1; i > n - 10; i--) {
      years.push({id: i, value: i});
    }

    let months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];

    this.setState({
      year: {id: n, value: n},
      years
    });

    const competitions = await Api.get('competitions');
    const { response, body } = competitions;
    switch (response.status) {
      case 200:
        let competitions = body.competitions;
        competitions.map((comp) => {
          let from = comp.from.match(/\d+/g);
          comp.from = months[parseInt(from[1]) - 1] + ', ' + from[2];

          let to = comp.to.match(/\d+/g);
          comp.to = months[parseInt(to[1]) - 1] + ', ' + to[2];

          let register_from = new Date(comp.register_from);
          let today = new Date();
          let diffTime = register_from - today;
          let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          comp.start = diffDays;

          register_from = comp.register_from.match(/\d+/g);
          comp.register_from = months[parseInt(register_from[1]) - 1] + ', ' + register_from[2];

          let register_to = comp.register_to.match(/\d+/g);
          comp.register_to = months[parseInt(register_to[1]) - 1] + ', ' + register_to[2];
        });
        
        this.setState({
          competitions,
          init_comps: competitions
        });
        break;
      default:
        break;
    }
  }

  handleSelectItem(id, target) {
    this.props.history.push('/competition/' + target, id);
  }

  render() {
    const { competitions } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container>
            <Row>
              <Col sm="12">
                {
                  competitions && competitions.length > 0 ? (
                    <CompetitionTable
                      items={competitions}
                      onSelect={this.handleSelectItem.bind(this)}
                    />
                  ) : (
                    <div className="fixed-content">
                      <h3 className="text-primary">
                        No competition exist!
                      </h3>
                    </div>
                  )
                }
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    )
  }
}

export default withRouter(Competitions);