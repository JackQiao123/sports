/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import Select from 'react-select';
import _ from 'lodash';

class PayDetailTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      column: null,
      data: [],
      direction: null,
      activePage: 1,
      per_page: 10,
      current_perPage: { label: 10, value: 10 },
      pageOptions: [
        { label: 10, value: 10 },
        { label: 20, value: 20 },
        { label: 50, value: 50 }
      ]
    };
    this.handleChangePerPage = this.handleChangePerPage.bind(this);
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps() {
    if (this.props.detail.length > 0) {
      this.setState({
        activePage: 1
      });
    }
    
    const { detail } = this.props;
    const { per_page } = this.state;
    this.setState({
      data: detail.slice(0, per_page)
    });
  }

  handlePaginationChange(e, { activePage }) {
    const { detail } = this.props;
    const { per_page } = this.state;
    if (activePage !== 1) {
      this.setState({
        activePage,
        data: detail.slice(((activePage - 1) * per_page), activePage * per_page)
      });
    } else {
      this.setState({
        activePage,
        data: detail.slice(0, per_page)
      });
    }
  }

  handleSort(clickedColumn) {
    const { column, data, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: _.sortBy(data, [clickedColumn]),
        direction: 'ascending'
      });

      return;
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending'
    });
  }

  handleChangePerPage(page_num) {
    const { detail } = this.props;
    this.setState({
      activePage: 1,
      current_perPage: page_num,
      per_page: page_num.value,
      data: detail.slice(0, page_num.value)
    });
  }

  render() {
    const {
      detail
    } = this.props;

    const {
      column,
      direction,
      data,
      activePage,
      per_page,
      pageOptions,
      current_perPage
    } = this.state;

    return (
      <Table sortable celled selectable unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              className="text-center"
              width="2"
              sorted={column === 'date' ? direction : null}
              onClick={this.handleSort.bind(this, 'date')}
            >
              Date
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'region' ? direction : null}
              onClick={this.handleSort.bind(this, 'region')}
            >
              Region
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'club' ? direction : null}
              onClick={this.handleSort.bind(this, 'club')}
            >
              Club
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'amount' ? direction : null}
              onClick={this.handleSort.bind(this, 'amount')}
            >
              Amount
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'expire' ? direction : null}
              onClick={this.handleSort.bind(this, 'expire')}
            >
              Percent (%)
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data && data.length > 0 ? (
              data.map((item, index) => (
                <Table.Row
                  key={index}
                >
                  <Table.Cell className="text-center">{item.created_at}</Table.Cell>
                  <Table.Cell className="text-center">{item.reg}</Table.Cell>
                  <Table.Cell className="text-center">{item.club}</Table.Cell>
                  <Table.Cell className="text-center">${item.amount}</Table.Cell>
                  <Table.Cell className="text-center">{item.percent}%</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan="7" className="text-center">No Transactions</Table.Cell>
              </Table.Row>
            )
          }
        </Table.Body>
        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="1">
              <Select
                name="pageOption"
                menuPlacement="top"
                classNamePrefix="react-select"
                placeholder="Per Page"
                defaultValue={pageOptions[0]}
                value={current_perPage}
                options={pageOptions}
                getOptionValue={option => option.label}
                getOptionLabel={option => option.value}
                onChange={(num) => {
                  this.handleChangePerPage(num);
                }}
              />
            </Table.HeaderCell>
            <Table.HeaderCell colSpan="4">
              <Menu floated="right" pagination>
                <Pagination
                  activePage={activePage}
                  onPageChange={this.handlePaginationChange.bind(this)}
                  totalPages={Math.ceil(detail.length / per_page)}
                />
              </Menu>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default PayDetailTable;
