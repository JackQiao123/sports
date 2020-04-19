/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component, Fragment } from 'react';
import { Alert } from 'reactstrap';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import Select from 'react-select';

import _ from 'lodash';
import { Genders } from '../configs/data';
import Bitmaps from '../theme/Bitmaps';

import Api from '../apis/app';

class ActiveUserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      column: null,
      data: [],
      direction: null,
      isOpenChangeModal: false,
      isOpenDeleteModal: false,
      confirmationMessage: '',
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
      userID: '',
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
      <Fragment>
        <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
          {
            this.state.messageStatus ? this.state.successMessage : this.state.failMessage
          }
        </Alert>
        <Table sortable celled selectable unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                width="2"
                className="text-center"
                sorted={column === 'name' ? direction : null}
                onClick={this.handleSort.bind(this, 'name')}
              >
                Name
              </Table.HeaderCell>
              <Table.HeaderCell
                className="text-center"
                sorted={column === 'org' ? direction : null}
                onClick={this.handleSort.bind(this, 'org')}
              >
                Org / Club
              </Table.HeaderCell>
              <Table.HeaderCell
                className="text-center"
                sorted={column === 'type' ? direction : null}
                onClick={this.handleSort.bind(this, 'type')}
              >
                Admin Type
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
                sorted={column === 'email' ? direction : null}
                onClick={this.handleSort.bind(this, 'email')}
              >
                Email
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              data && data.length > 0 && (
                data.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>
                      <img
                        src={
                          item.profile_image ? item.profile_image : 
                          (item.gender == 1 ? Bitmaps.maleAvatar : Bitmaps.femaleAvatar)
                        }
                        className="table-avatar mr-2"
                      />
                      {item.name}
                      {' '}
                      {item.patronymic == '-' ? '' : item.patronymic}
                      {' '}
                      {item.surname}
                    </Table.Cell>
                    <Table.Cell className="text-center">{item.name_o}</Table.Cell>
                    <Table.Cell className="text-center">
                      {item.parent_id == 0 ? 'NF' : (item.is_club == 1 ? 'Club' : 'Ref')}
                    </Table.Cell>
                    <Table.Cell className="text-center">{item.gender == 1 ? Genders[0].name : Genders[1].name}</Table.Cell>
                    <Table.Cell className="text-center">{item.birthday}</Table.Cell>
                    <Table.Cell>{item.email}</Table.Cell>
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
              <Table.HeaderCell colSpan="7">
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
      </Fragment>
    );
  }
}

export default ActiveUserTable;