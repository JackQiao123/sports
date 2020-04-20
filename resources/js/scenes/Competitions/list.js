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

class CompetitionList extends Component {
  constructor(props) {
    super(props);

    this.state={
      competitions: [],
      start: [],
      countDown: []
    };
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];

    const competitions = await Api.get('competitions');
    const { response, body } = competitions;
    switch (response.status) {
      case 200:
        let competitions = [];

        if (user.user.is_nf == 1) {
          competitions = body.competitions.filter(item => item.type == 'inter');
        } else if (user.user.is_club_member == 1) {
          competitions = body.competitions.filter(item => item.type == 'reg');
        } else {
          competitions = body.competitions.filter(item => item.type == 'nf');
        }

        let start = [];
        let countDown = [];

        competitions.map(comp => {
          start.push(new Date(comp.register_from).getTime());
          countDown.push(new Date(comp.register_to).getTime() + 86400000);

          let from = comp.from.match(/\d+/g);
          comp.from = months[parseInt(from[1]) - 1] + ', ' + from[2];

          let to = comp.to.match(/\d+/g);
          comp.to = months[parseInt(to[1]) - 1] + ', ' + to[2];

          let register_from = comp.register_from.match(/\d+/g);
          comp.register_from = months[parseInt(register_from[1]) - 1] + ', ' + register_from[2];

          let register_to = comp.register_to.match(/\d+/g);
          comp.register_to = months[parseInt(register_to[1]) - 1] + ', ' + register_to[2];
        });
        
        this.setState({
          competitions,
          start,
          countDown
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
    const { competitions, start, countDown } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container>
            <Row>
              <Col sm="12">
                {
                  competitions && competitions.length > 0 && (
                    <CompetitionTable
                      items={competitions}
                      inscribe={true}
                      start={start}
                      countDown={countDown}
                      onSelect={this.handleSelectItem.bind(this)}
                    />
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

export default withRouter(CompetitionList);