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
import { Dans, Genders } from '../configs/data';
import Bitmaps from '../theme/Bitmaps';

class SearchDataTable extends Component {
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
        { label: 20, value: 20 },
        { label: 50, value: 50 }
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
    const user_info = JSON.parse(localStorage.getItem('auth'));
    const { items } = props;

    if (user_info.user) {
      this.setState({
        user: user_info.user.member_info
      });
    }
    
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
    return (
      <Table sortable celled selectable unstackable>
        
      </Table>
    );
  }
}

export default SearchDataTable;