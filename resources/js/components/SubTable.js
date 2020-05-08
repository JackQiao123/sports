/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component, Fragment } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import Select from 'react-select';

import _ from 'lodash';
import { Genders, referee_type_options } from '../configs/data';

class SubTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      column: null,
      data: [],
      direction: null,
      activePage: 1,
      per_page: 10,
      current_perPage: { label: 10, value: 10 },
      pageOptions: [
        { label: 10, value: 10 },
        { label: 20, value: 20 }
      ]
    };
    
    this.handleChangePerPage = this.handleChangePerPage.bind(this);
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    const user_info = JSON.parse(localStorage.getItem('auth'));
    if (user_info.user) {
      this.setState({
        user: user_info.user.member_info
      });
    }
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
      onSelect,
      type,
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
      <Table sortable celled selectable unstackable className="mt-2">
        {
          type === 'org' && (
            <Fragment>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell
                    className="text-center"
                    sorted={column === 'club_name' ? direction : null}
                    onClick={this.handleSort.bind(this, 'club_name')}
                  >
                    Club Name
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width="1"
                    className="text-center"
                    sorted={column === 'register_no' ? direction : null}
                    onClick={this.handleSort.bind(this, 'register_no')}
                  >
                    Register No
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    className="text-center"
                    sorted={column === 'mobile_phone' ? direction : null}
                    onClick={this.handleSort.bind(this, 'mobile_phone')}
                  >
                    Mobile
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    className="text-center"
                    sorted={column === 'email' ? direction : null}
                    onClick={this.handleSort.bind(this, 'email')}
                  >
                    Email
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    width="6"
                    className="text-center"
                    sorted={column === 'addressline1' ? direction : null}
                    onClick={this.handleSort.bind(this, 'addressline1')}
                  >
                    Address
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  (data && data.length > 0) ? (
                    data.map((item, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>
                          <a className="detail-link" onClick={() => onSelect(item.id)}>{item.name_o}</a>
                        </Table.Cell>
                        <Table.Cell className="text-center">{item.register_no}</Table.Cell>
                        <Table.Cell className="text-center">{item.mobile_phone}</Table.Cell>
                        <Table.Cell className="text-center">{item.email}</Table.Cell>
                        <Table.Cell>
                          {(item.addressline1 && item.addressline1 != '' && item.addressline1 != '-') ? item.addressline1 + ', ' : '' }
                          {(item.addressline2 && item.addressline2 != '' && item.addressline2 != '-') ? item.addressline2 + ', ' : '' }
                          {(item.city && item.city != '' && item.city != '-') ? item.city + ', ' : '' }
                          {(item.state && item.state != '' && item.state != '-') ? item.state + ', ' : '' }
                          {item.zip_code}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan="5" className="text-center">No Clubs</Table.Cell>
                    </Table.Row>
                  )
                }
              </Table.Body>
            </Fragment>
          )
        }
        {
          type === 'member' && (
            <Fragment>
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
                    sorted={column === 'role' ? direction : null}
                    onClick={this.handleSort.bind(this, 'role')}
                  >
                    Role
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
                  <Table.HeaderCell className="text-center">
                    Status
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  (data && data.length > 0) ? (
                    data.map((item, index) => (
                      <Table.Row 
                        key={index}
                      >
                        <Table.Cell>
                          <span className="text-primary mr-2">
                            <a className="detail-link" onClick={() => onSelect(item.id)}>
                              {item.surname && item.surname.toUpperCase()} {item.patronymic != '-' && item.patronymic} {item.name}
                            </a>
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-center">
                          {
                            item.role_id == 3 ? referee_type_options.filter(ref => ref.value == item.position)[0].label
                              : item.role_name
                          }
                        </Table.Cell>
                        <Table.Cell className="text-center">{item.gender == 1 ? Genders[0].name : Genders[1].name}</Table.Cell>
                        <Table.Cell className="text-center">{item.birthday}</Table.Cell>
                        {
                          item.active == 0 ? (
                            <Table.Cell className="text-center">
                              <div className="text-danger text-center">
                                <i className="fa fa-user fa-lg" />
                              </div>
                            </Table.Cell>
                          ) : (
                            <Table.Cell className="text-center">
                              <div className="text-success text-center">
                                <i className="fa fa-user fa-lg" />
                              </div>
                            </Table.Cell>
                          )
                        }
                          
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan="5" className="text-center">No Members</Table.Cell>
                    </Table.Row>
                  )
                }
              </Table.Body>
            </Fragment>
          )
        }
        {
          type === 'club' && (
            <Fragment>
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
                    sorted={column === 'role' ? direction : null}
                    onClick={this.handleSort.bind(this, 'role')}
                  >
                    Role
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
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  (data && data.length > 0) ? (
                    data.map((item, index) => (
                      <Table.Row 
                        key={index}
                        disabled={item.role_id == 4 && item.active == 0}
                      >
                        <Table.Cell>
                          {
                            item.active == 1 ? (
                              <a className="detail-link" onClick={() => onSelect(item.id)}>
                                {item.surname && item.surname.toUpperCase()} {item.name}
                              </a>
                            ) : (
                              <span className="text-primary mr-2">
                                {item.surname && item.surname.toUpperCase()} {item.name}
                                </span>
                            )
                          }
                        </Table.Cell>
                        <Table.Cell className="text-center">{item.role_name}</Table.Cell>
                        <Table.Cell className="text-center">{item.gender == 1 ? Genders[0].name : Genders[1].name}</Table.Cell>
                        <Table.Cell className="text-center">{item.birthday}</Table.Cell>
                        <Table.Cell className="text-center">{item.role_id == 4 && item.weight + " Kg"}</Table.Cell>
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
                          item.active == 1 && (
                            <Table.Cell className="text-center">
                              <div className="text-success text-center">
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
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan="6" className="text-center">No Members</Table.Cell>
                    </Table.Row>
                  )
                }
              </Table.Body>
            </Fragment>
          )
        }
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
            <Table.HeaderCell colSpan={type === 'org' ? 4 : 6}>
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

SubTable.defaultProps = {
  onSelect: () => {}
};

export default SubTable;
