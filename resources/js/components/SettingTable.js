/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import { Button, Input, InputGroup, InputGroupAddon, } from 'reactstrap';
import Select from 'react-select';
import _ from 'lodash';

import Api from '../apis/app';

class SettingTable extends Component {
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
      ],
      editable: false,
      editID: '',
      price: null,
      percent: null
    };

    this.handleChangePerPage = this.handleChangePerPage.bind(this);
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps() {
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

  handleEdit(id) {
    this.setState({
      editable: true,
      editID: id,
      price: null,
      percent: null
    });
  }

  async handleUpdate(id, price, percent) {
    this.setState({
      editable: false,
      editID: ''
    });

    let newData = {};

    newData = {
      price: this.state.price ? this.state.price : price,
      percent: this.state.percent ? this.state.percent : percent
    };

    const data = await Api.put(`setting/${id}`, newData);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        const { per_page } = this.state;
    
        this.setState({
          data: body.slice(0, per_page)
        });
        break;
      default:
        break;
    }
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
      current_perPage,
      editable,
      editID,
      price,
      percent
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
              National Federtation Name
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'price' ? direction : null}
              onClick={this.handleSort.bind(this, 'price')}
            >
              Membership Price per Player
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'percent' ? direction : null}
              onClick={this.handleSort.bind(this, 'percent')}
            >
              Percentage of Price
            </Table.HeaderCell>
            <Table.HeaderCell className="text-center" width="2">
              Edit
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data && data.length > 0 && (
              data.map((item, index) => (
                editable && editID == item.id ? (
                  <Table.Row
                    key={index}
                  >
                    <Table.Cell>{item.name_o}</Table.Cell>
                    <Table.Cell className="text-center">
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                        <Input 
                          name="price"
                          type="number"
                          placeholder="price"
                          onChange={(evt) => {
                            this.setState({price: evt.target.value})
                          }}
                          defaultValue={!price ? item.price : price}
                        />
                      </InputGroup>
                    </Table.Cell>
                    <Table.Cell className="text-center">
                      <InputGroup>
                        <Input 
                          name="percent"
                          type="number"
                          placeholder="percent"
                          onChange={(evt) => {
                            this.setState({percent: evt.target.value})
                          }}
                          defaultValue={!percent ? item.percent : percent} 
                        />
                        <InputGroupAddon addonType="append">%</InputGroupAddon>
                      </InputGroup>
                    </Table.Cell>
                    <Table.Cell className="text-center">
                      <div className="save actions d-flex w-100 justify-content-center align-items-center">
                        <Button
                          color="primary"
                          type="button"
                          onClick={this.handleUpdate.bind(this, item.organization_id, item.price, item.percent)}
                        >
                          <i className="fa fa-save fa-lg" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  <Table.Row
                    key={index}
                  >
                    <Table.Cell>{item.name_o}</Table.Cell>
                    <Table.Cell className="text-center">
                      $ {(editID && editID == item.id && !price) ? price : item.price}
                    </Table.Cell>
                    <Table.Cell className="text-center">
                      {(editID && editID == item.id && !percent) ? percent : item.percent} %
                    </Table.Cell>
                    <Table.Cell className="text-center">
                      <div className="actions d-flex w-100 justify-content-center align-items-center">
                        <Button
                          color="success"
                          type="button"
                          onClick={this.handleEdit.bind(this, item.id)}
                        >
                          <i className="fa fa-pencil-alt fa-lg" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )
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
            <Table.HeaderCell colSpan="3">
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

export default SettingTable;
