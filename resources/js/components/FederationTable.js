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

import {countries} from '../configs/data';

class FederationTable extends Component {
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

  componentWillReceiveProps(props) {

    if (props.items.length > 0) {
      this.setState({
        activePage: 1
      });
    }

    const { items } = props;
    const { per_page } = this.state;

    this.setState({
      data: items.slice(0, per_page)
    });
  }

  handlePaginationChange(e, { activePage }) {
    const { items } = this.props;
    const { per_page } = this.state;
    if (activePage !== 1) {
      this.setState({
        activePage,
        data: items.slice(((activePage - 1) * per_page), activePage * per_page)
      });
    } else {
      this.setState({
        activePage,
        data: items.slice(0, per_page)
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
    const { items } = this.props;
    this.setState({
      activePage: 1,
      current_perPage: page_num,
      per_page: page_num.value,
      data: items.slice(0, page_num.value)
    });
  }

  render() {
    const {
      items, onSelect
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
              width="3"
              className="text-center"
              sorted={column === 'name' ? direction : null}
              onClick={this.handleSort.bind(this, 'name')}
            >
              Name
            </Table.HeaderCell>
            <Table.HeaderCell
              width="3"
              className="text-center"
              sorted={column === 'url' ? direction : null}
              onClick={this.handleSort.bind(this, 'url')}
            >
              URL
            </Table.HeaderCell>
            <Table.HeaderCell
              width="2"
              className="text-center"
              sorted={column === 'country' ? direction : null}
              onClick={this.handleSort.bind(this, 'country')}
            >
              Country
            </Table.HeaderCell>
            <Table.HeaderCell
              width="2"
              className="text-center"
              sorted={column === 'email' ? direction : null}
              onClick={this.handleSort.bind(this, 'email')}
            >
              Email
            </Table.HeaderCell>
            <Table.HeaderCell
              width="1"
              className="text-center"
              sorted={column === 'phone' ? direction : null}
              onClick={this.handleSort.bind(this, 'phone')}
            >
              Phone
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'address' ? direction : null}
              onClick={this.handleSort.bind(this, 'address')}
            >
              Address
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data && data.length > 0 && (
              data.map((item, index) => (
                <Table.Row
                  key={index}
                >
                  <Table.Cell>
                    <a className="detail-link" onClick={() => onSelect(item.id)}>{item.name_o}</a>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <a className="detail-link" href={"http://" + item.country + ".livemedia.uz"}>{item.country + ".livemedia.uz"}</a>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {countries.filter(country => country.countryCode == item.country)[0].name}
                  </Table.Cell>
                  <Table.Cell className="text-center">{item.email}</Table.Cell>
                  <Table.Cell className="text-center">{item.mobile_phone}</Table.Cell>
                  <Table.Cell>
                    {(item.addressline1 && item.addressline1 !== '' && item.addressline1 !== '-') ? `${item.addressline1}, ` : '' }
                    {(item.addressline2 && item.addressline2 !== '' && item.addressline2 !== '-') ? `${item.addressline2}, ` : '' }
                    {(item.city && item.city !== '' && item.city !== '-') ? `${item.city}, ` : '' }
                    {(item.state && item.state !== '' && item.state !== '-') ? `${item.state}, ` : '' }
                    {item.zip_code}
                  </Table.Cell>
                </Table.Row>
              ))
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
            <Table.HeaderCell colSpan="5">
              <Menu floated="right" pagination>
                <Pagination
                  activePage={activePage}
                  onPageChange={this.handlePaginationChange.bind(this)}
                  totalPages={Math.ceil(items.length / per_page)}
                />
              </Menu>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

FederationTable.defaultProps = {
  onSelect: () => {}
};

export default FederationTable;