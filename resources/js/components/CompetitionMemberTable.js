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
import { Genders, referee_type_options } from '../configs/data';
import Bitmaps from '../theme/Bitmaps';

class CompetitionMemberTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      column: null,
      data: [],
      direction: null,
      activePage: 1,
      per_page: 5,
      current_perPage: { label: 5, value: 5 },
      pageOptions: [
        { label: 5, value: 5 },
        { label: 10, value: 10 },
        { label: 20, value: 20 }
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
              sorted={column === 'org' ? direction : null}
              onClick={this.handleSort.bind(this, 'org')}
            >
              Org
            </Table.HeaderCell>
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
              sorted={column === 'position' ? direction : null}
              onClick={this.handleSort.bind(this, 'position')}
            >
              Position
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
            <Table.HeaderCell className="text-center" width="2">
              <CustomInput
                id="selectAllMember"
                type="checkbox"
                checked={data.length > 0 && data.filter(item => item.checked === true).length === data.length}
                onChange={(event) => { onSelectAll(data, event); this.setState({ checkedAll: event.target.checked }); }}
              />
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
                  <Table.Cell className="text-center">{item.org_name}</Table.Cell>
                  <Table.Cell>
                    <img src={item.profile_image ? item.profile_image : 
                      (item.gender == 1 ? Bitmaps.maleAvatar : Bitmaps.femaleAvatar)} className="table-avatar mr-2" />
                    {' '}
                    {item.surname && item.surname.toUpperCase()}
                    {' '}
                    {item.patronymic !== '-' && item.patronymic}
                    {' '}
                    {item.name}
                  </Table.Cell>
                  <Table.Cell className="text-center">{item.role_name}</Table.Cell>
                  <Table.Cell className="text-center">
                    {
                      item.role_name == 'Referee' ? (
                        referee_type_options.filter(type => type.value == item.position)[0].label
                      ) : (
                        item.position
                      )
                    }
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {item.gender && item.gender == 1 ? Genders[0].name : Genders[1].name}
                  </Table.Cell>
                  <Table.Cell className="text-center">{item.birthday}</Table.Cell>
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
            ) : (
              <Table.Row>
                <Table.Cell className="text-center" colSpan="6">
                  <span className="text-center">No Members.</span>
                </Table.Cell>
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
            <Table.HeaderCell colSpan="6">
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

CompetitionMemberTable.defaultProps = {
  onSelectAll: () => {},
  onSelect: () => {}
};

export default CompetitionMemberTable;