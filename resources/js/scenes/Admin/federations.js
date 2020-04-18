/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import Select from 'react-select';
import Api from '../../apis/app';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import FederationTable from '../../components/FederationTable';

import {countries} from '../../configs/data';

class Federation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nfs: [],
      search_nf: [],
      filter_country: [],
      country: ''
    }
  }

  componentDidMount() {
    this.componentWillReceiveProps();
  }

  async componentWillReceiveProps() {
    const nfs = await Api.get('all-nf');
    const {response, body} = nfs;
    switch (response.status) {
      case 200:
        let filter_country = [{name: "All", countryCode: ''}];

        for (let i = 0; i < body.nfs.length; i++) {
          filter_country.push(countries.filter(country => country.countryCode == body.nfs[i].country)[0]);
        }

        this.setState({
          filter_country: filter_country,
          nfs: body.nfs,
          search_nf: body.nfs
        })
        break;
      default:
        break;
    }
  }

  handleSelectItem(id) {
    localStorage.setItem('nf_id', id)
    this.props.history.push('/admin/search');
  }

  render() {
    const {nfs, search_nf, filter_country, country} = this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <h4><b>Search Federations</b></h4>

            <div className="content">
              <Select
                className="col-sm-3 mb-2 pl-0 select-box"
                classNamePrefix="react-select-lg"
                placeholder="Country"
                options={filter_country}
                value={country ? country : filter_country[0]}
                getOptionValue={option => option.countryCode}
                getOptionLabel={option => option.name}
                onChange={(item) => {
                  if (item.countryCode == '') {
                    this.setState({
                      search_nf: nfs,
                      country: item
                    });
                  } else {
                    this.setState({
                      search_nf: nfs.filter(nf => nf.country == item.countryCode),
                      country: item
                    });
                  }
                }}
              />
              {
                search_nf && search_nf.length > 0 && (
                  <div className="table-responsive">
                    <FederationTable
                      items={search_nf}
                      onSelect={this.handleSelectItem.bind(this)}
                    />
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Federation);