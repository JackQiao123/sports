/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import { CustomInput } from 'reactstrap';
import Select from 'react-select';

import _ from 'lodash';
import { Genders } from '../configs/data';
import Bitmaps from '../theme/Bitmaps';

class PayerTable extends Component {
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
        { label: 50, value: 50 },
        { label: 100, value: 100 }
      ]
    };
    this.handleChangePerPage = this.handleChangePerPage.bind(this);
  }

  componentDidMount() {
    if (this.props.items.length > 0) {
      this.setState({
        activePage: 1
      });
    }
    const { items } = this.props;
    const { per_page } = this.state;
    this.setState({
      data: items.slice(0, per_page)
    });
  }

  componentWillReceiveProps(props) {
    const { items } = props;
    if (this.props.items !== items) {
      if (props.items.length > 0) {
        this.setState({
          activePage: 1
        });
      }
      const { per_page } = this.state;
      this.setState({
        data: items.slice(0, per_page)
      });
    }
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
      onSelect,
      onSelectAll,
      onDetail,
      items
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
              sorted={column === 'name' ? direction : null}
              onClick={this.handleSort.bind(this, 'name')}
            >
              Name
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
              sorted={column === 'gender' ? direction : null}
              onClick={this.handleSort.bind(this, 'gender')}
            >
              Gender
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'birthday' ? direction : null}
              onClick={this.handleSort.bind(this, 'birthday')}
            >
              Birthday
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              width="2"
              sorted={column === 'email' ? direction : null}
              onClick={this.handleSort.bind(this, 'email')}
            >
              Email
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'weight' ? direction : null}
              onClick={this.handleSort.bind(this, 'weight')}
            >
              Weight
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'dan' ? direction : null}
              onClick={this.handleSort.bind(this, 'dan')}
            >
              Dan
            </Table.HeaderCell>
            <Table.HeaderCell className="text-center">
              Status
            </Table.HeaderCell>
            <Table.HeaderCell className="text-center" width="2">
              <CustomInput
                id="selectAll"
                type="checkbox"
                checked={data.filter(item => item.checked === true).length === data.length}
                onChange={(event) => { onSelectAll(data, event); this.setState({ checkedAll: event.target.checked }); }}
              />
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
                    <img src={item.profile_image ? item.profile_image : (item.gender == 1 ? Bitmaps.maleAvatar : Bitmaps.femaleAvatar)} className="table-avatar mr-2" />
                    {' '}
                    <a className="detail-link" onClick={() => onDetail(item.id)}>
                      {item.surname && item.surname.toUpperCase()}
                      {' '}
                      {item.name}
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    {item.region}
                  </Table.Cell>
                  <Table.Cell>
                    {item.club}
                  </Table.Cell>
                  <Table.Cell className="text-center">{item.gender && item.gender == 1 ? Genders[0].name : Genders[1].name}</Table.Cell>
                  <Table.Cell className="text-center">{item.birthday}</Table.Cell>
                  <Table.Cell>{item.email}</Table.Cell>
                  <Table.Cell className="text-center">
                    {item.weight && item.weight != '' && item.weight + ' Kg'}
                  </Table.Cell>
                  <Table.Cell className="text-center">{item.dan}</Table.Cell>
                  {
                    item.active == 0 && (
                      <Table.Cell className="text-center">
                        <div className="text-danger text-center">
                          <i className="fa fa-user fa-lg" />
                        </div>
                      </Table.Cell>
                    )
                  }
                  {
                    item.active == 2 && (
                      <Table.Cell className="text-center">
                        <div className="text-warning text-center">
                          <i className="fa fa-user fa-lg" />
                        </div>
                      </Table.Cell>
                    )
                  }
                  <Table.Cell className="text-center">
                    <CustomInput
                      id={item.id}
                      type="checkbox"
                      checked={!!item.checked}
                      onChange={(event) => { onSelect(item.id, event.target.checked); }}
                    />
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
            <Table.HeaderCell colSpan="9">
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

PayerTable.defaultProps = {
  onSelectAll: () => {},
  onSelect: () => {},
  onDetail: () => {}
};

export default PayerTable;