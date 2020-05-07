/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import {
  Table
} from 'semantic-ui-react';

import _ from 'lodash';

class CompetitionTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      intervalId: '',
      start: [],
      expire: []
    };

    this.timer = this.timer.bind(this);
  }

  componentDidMount() {
    const { items, countDown } = this.props;

    if (countDown !== undefined) {
      let intervalId = setInterval(this.timer, 1000);

      this.setState({
        intervalId
      });
    }
    
    this.setState({
      data: items
    });
  }

  timer() {
    const { countDown } = this.props;
    let expire = [];

    for (let i = 0; i < countDown.length; i++) {
      let now = new Date().getTime();
      let distance = countDown[i] - now;

      if (distance > 0) {
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        expire.push(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");
      } else {
        expire.push('Expired.');
      }
    }

    this.setState({
      expire
    });
  }

  componentWillReceiveProps(props) {
    const { items } = props;
    if (this.props.items !== items) {
      this.setState({
        data: items
      });
    }
  }

  render() {
    const {
      attend,
      start,
      onSelect
    } = this.props;

    const { data, expire } = this.state;

    return (
      <Table className="competition" unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell className="text-center">Competition Period</Table.HeaderCell>            
            <Table.HeaderCell className="text-center">Name</Table.HeaderCell>
            <Table.HeaderCell className="text-center">Place</Table.HeaderCell>
            <Table.HeaderCell className="text-center">Registration Period</Table.HeaderCell>
            {
              expire.length > 0 && (
                <Table.HeaderCell className="text-center">Deadline</Table.HeaderCell>
              )
            }
            <Table.HeaderCell className="text-center">Action</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data && data.length > 0 && (
              data.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell width="1" className="text-center">{item.from} ~ {item.to}</Table.Cell>
                  <Table.Cell width="4" className="text-center">
                    <a onClick={() => onSelect(item.id, 'detail')}>
                      <b>{item.name}</b>
                    </a>
                  </Table.Cell>
                  <Table.Cell width="3" className="text-center">
                    <a onClick={() => onSelect(item.id, 'detail')}>
                      {item.place}
                    </a>
                  </Table.Cell>
                  <Table.Cell width="2" className="text-center">
                    {item.register_from} ~ {item.register_to}
                  </Table.Cell>
                  {
                    expire.length > 0 && (
                      <Table.Cell width="2" className="text-center">
                        {
                          (start[index] - (new Date().getTime()) < 0) && (
                            <b className="text-danger">{expire[index]}</b>
                          )
                        }
                      </Table.Cell>
                    )
                  }
                  <Table.Cell width="2" className="text-center">
                    {
                      (attend && attend[index]) && 
                      (expire && expire[index] != 'Expired.') &&
                      (start[index] - (new Date().getTime()) < 0) ? (
                        <a onClick={() => onSelect(item.id, 'inscribe')}>
                          Inscribe
                        </a>
                      ) : (
                        <a onClick={() => onSelect(item.id, 'detail')}>
                          Detail
                        </a>
                      )
                    }
                  </Table.Cell>
                </Table.Row>
              ))
            )
          }
        </Table.Body>
      </Table>
    );
  }
}

CompetitionTable.defaultProps = {
  onSelect: () => {}
};

export default CompetitionTable;