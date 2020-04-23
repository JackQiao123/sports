/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component, Fragment } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import { Button } from 'reactstrap';
import Select from 'react-select';

import _ from 'lodash';

class CompetitionClubTable extends Component {
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
      is_super,
      detail, inscribe,
      onSelect,
      onDelete,
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
              sorted={column === 'club' ? direction : null}
              onClick={this.handleSort.bind(this, 'club')}
            >
              Club
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
              sorted={column === 'male' ? direction : null}
              onClick={this.handleSort.bind(this, 'male')}
            >
              Male
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'female' ? direction : null}
              onClick={this.handleSort.bind(this, 'female')}
            >
              Female
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'staff' ? direction : null}
              onClick={this.handleSort.bind(this, 'staff')}
            >
              Staff
            </Table.HeaderCell>
            <Table.HeaderCell className="text-center">Status</Table.HeaderCell>
            {
              (detail || is_super == 1) && (
                <Table.HeaderCell className="text-center">Action</Table.HeaderCell>
              )
            }
            {
              is_super != 1 && inscribe && (
                <Table.HeaderCell className="text-center">Edit / Delete</Table.HeaderCell>
              )
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data && data.length > 0 && (
              data.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell className="text-center">{item.club_name}</Table.Cell>
                  <Table.Cell className="text-center">{item.reg_name}</Table.Cell>
                  <Table.Cell className={item.status == 0 ? "text-center text-danger" : "text-center"}>
                    {item.male == 0 ? '-' : item.male}
                  </Table.Cell>
                  <Table.Cell className={item.status == 0 ? "text-center text-danger" : "text-center"}>
                    {item.female == 0 ? '-' : item.female}
                  </Table.Cell>
                  <Table.Cell className={item.status == 0 ? "text-center text-danger" : "text-center"}>
                    {item.officer == 0 ? '-' : item.officer}
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {
                      item.status == 0 && (
                        <span>Waiting ...</span>
                      )
                    }
                    {
                      item.status == 1 && (
                        <span>
                          <i className="fa fa-check text-success"></i> Accepted
                        </span>
                      )
                    }
                    {
                      item.status == 2 && (
                        <span>Not received</span>
                      )
                    }
                  </Table.Cell>
                  {
                    (detail || is_super == 1) && (

                      <Table.Cell className="text-center text-info">
                        <div>
                          <a className="detail-link" onClick={() => onSelect(item.id, 'detail')}>
                            <i className="fa fa-file"></i> Detail
                          </a>
                          &nbsp;|&nbsp;
                          <a className="detail-link" onClick={() => onSelect(item.id, 'export')}>
                            <i className="fa fa-file-pdf"></i> Export
                          </a>
                        </div>
                      </Table.Cell>
                    )
                  }
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

CompetitionClubTable.defaultProps = {
  onSelect: () => {},
  onDelete: () => {},
};

export default CompetitionClubTable;