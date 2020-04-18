/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import { 
  Row, Col
} from 'reactstrap';
import Api from '../../apis/app';
import Chart from 'react-apexcharts';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import NFTable from '../../components/NFTable';
import PayDetailTable from '../../components/PayDetailTable';

class Detail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      detail: [],
      nfs: [],

      series: [{
        data: [{
            x: new Date(1538778600000),
            y: [6629.81, 6650.5, 6623.04, 6633.33]
          },
          {
            x: new Date(1538780400000),
            y: [6632.01, 6643.59, 6620, 6630.11]
          },
          {
            x: new Date(1538782200000),
            y: [6630.71, 6648.95, 6623.34, 6635.65]
          },
          {
            x: new Date(1538784000000),
            y: [6635.65, 6651, 6629.67, 6638.24]
          },
          {
            x: new Date(1538785800000),
            y: [6638.24, 6640, 6620, 6624.47]
          }
        ]
      }],
      options: {
        chart: {
          type: 'candlestick',
          height: 350
        },
        title: {
          text: 'Totoal Amount Chart',
          align: 'center',
          style: {
            color: '#ffc107'
          }
        },
        xaxis: {
          type: 'datetime',
          labels: {
            style: {
              colors: '#ffc107'
            }
          }
        },
        yaxis: {
          tooltip: {
            enabled: true
          },
          labels: {
            style: {
              colors: '#ffc107'
            }
          }
        }
      }
    };
  }

  async componentDidMount() {
    const org = await Api.get('finance');
    const { response, body } = org;
    switch (response.status) {
      case 200:
        this.setState({
          nfs: body.nfs
        });
        break;
      default:
        break;
    }
  }

  async handleSelectItem(id) {
    const trans = await Api.get(`transdetail/${id}`);
    const { response, body } = trans;
    switch (response.status) {
      case 200:
        for (let i = 0; i < body.detail.length; i++) {
          body.detail[i].created_at = body.detail[i].created_at.substring(0, 10);
        }
        this.setState({
          detail: body.detail
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { nfs, detail } = this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <h4><b>All Amount from National Federations</b></h4>

            <div className="content">
              <Row className="row-0">
                <Col sm="12">
                  <Chart
                    options={this.state.options}
                    series={this.state.series}
                    height="300"
                    type="candlestick"
                  />
                </Col>
              </Row>
              <Row>
                <Col sm="6">
                  <div className="table-responsive mt-5">
                  {
                    nfs.length > 0 && (
                      <NFTable
                        items={nfs}
                        onSelect={this.handleSelectItem.bind(this)}
                      />
                    )
                  }
                  </div>
                </Col>
                <Col sm="6">
                  <div className="table-responsive mt-5">
                  {
                    detail.length > 0 && (
                      <PayDetailTable
                        detail={detail}
                      />  
                    )
                  }
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Detail);