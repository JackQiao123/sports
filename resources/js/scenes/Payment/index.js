/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/style-prop-object */
/* eslint-disable radix */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/sort-comp */
import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, Label, Input, Button, Form, FormGroup, FormFeedback,
  TabContent, TabPane, Nav, NavItem, NavLink, Alert
} from 'reactstrap';
import classnames from 'classnames';
import {
  withRouter
} from 'react-router-dom';
import Select from 'react-select';
import Card from 'card-react';
import { Image } from 'semantic-ui-react';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import PayerTable from '../../components/PayerTable';
import { Dans, search_genders } from '../../configs/data';
import Bitmaps from '../../theme/Bitmaps';
import ENV from '../../configs/env';

class Payment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      is_club_member: 0,
      is_nf: 0,
      pay_status: false,
      members: null,
      player_list: null,
      filter_data: null,
      weights: null,
      orgs: [],
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
      pay_method: 'basic_card',
      filter_members: {
        search: '',
        region: null,
        club: '',
        gender: null,
        weight: null,
        dan: null
      },
      payMembers: [],
      price: 0,
      per_price: 0.00,
      isSubmitting: false,
      priceData: {
        card_number: '',
        card_name: '',
        card_expiry_date: '',
        card_cvc: ''
      }
    };
  }

  async componentDidMount() {
    this.componentWillReceiveProps(this.props);
    const user = JSON.parse(localStorage.getItem('auth'));
    const user_info = user.user.member_info;
    this.loadStripe();
    const weight_list = await Api.get('weights');
    switch (weight_list.response.status) {
      case 200:
        this.setState({
          weights: weight_list.body
        });
        break;
      default:
        break;
    }

    const cost = await Api.get(`cost/${user_info.organization_id}`);
    switch (cost.response.status) {
      case 200:
        this.setState({
          per_price: cost.body
        });
        break;
      default:
        break;
    }
    const org_response = await Api.get(`organization-child/${user_info.organization_id}`);
    const { response, body } = org_response;
    switch (response.status) {
      case 200:
        const orgArr = ['All'];

        for (let i = 0; i < body.length; i++) {
          if (body[i].is_club !== 1) {
            orgArr.push(body[i].name_o);
          }
        }

        const orgList = orgArr.map((org, Index) => <option key={Index} value={org} />);
        this.setState({
          orgs: orgList
        });
        break;
      default:
        break;
    }
    this.getMembers();
  }

  async componentWillReceiveProps(props) {
    const pay_data = JSON.parse(localStorage.getItem('payme_data'));
    if (pay_data && pay_data.amount) {
      const data = await Api.post('pay-now', pay_data);
      const { response, body } = data;
      switch (response.status) {
        case 200:
          // this.setState({
          //   alertVisible: true,
          //   messageStatus: true,
          //   isSubmitting: false,
          //   successMessage: body.message
          // });
          // setTimeout(() => {
          //   this.getMembers();
          // }, 4000);
          break;
        case 406:
          // this.setState({
          //   alertVisible: true,
          //   messageStatus: false,
          //   isSubmitting: false,
          //   failMessage: body.message
          // });
          break;
        default:
          break;
      }
      // setTimeout(() => {
      //   this.setState({ alertVisible: false });
      // }, 5000);
      localStorage.removeItem('payme_data');
    }
  }

  async getMembers() {
    const user_info = JSON.parse(localStorage.getItem('auth'));
    this.setState({
      user: user_info.user.member_info,
      is_club_member: user_info.user.is_club_member,
      is_nf: user_info.user.is_nf,
      pay_method: user_info.user.member_info.country === 'uz' ? 'payme' : 'basic_card'
    });
    if (user_info.user) {
      const data = await Api.get(`club-members/${user_info.user.member_info.organization_id}`);
      const { response, body } = data;
      switch (response.status) {
        case 200:
          this.setState({
            filter_data: body,
            player_list: body,
            members: body,
            pay_status: false,
            payMembers: null,
            isSubmitting: false,
            filter_members: {
              search: '',
              region: '',
              club: '',
              gender: null,
              weight: null,
              dan: null
            }
          });
          break;
        case 406:
          this.setState({
            filter_data: [],
            player_list: [],
            members: []
          });
          break;
        default:
          break;
      }
    }
  }

  handleChangeCardInfo(field, event) {
    const { priceData } = this.state;
    priceData[field] = event.target.value;
    this.setState({
      priceData
    });
  }

  handleSelectPlayer(player, checked) {
    const { members, per_price, priceData } = this.state;
    for (let i = 0; i < members.length; i++) {
      const item = members[i];
      if (item.id === player) {
        item.checked = checked;
      }
    }

    this.setState({
      price: (members.filter(item => item.checked === true).length * per_price).toFixed(2)
    });

    this.setState({
      price: members.filter(item => item.checked === true).length * per_price,
      members,
      payMembers: members.filter(item => item.checked === true),
      priceData
    });
  }

  handleSelectAll(data, event) {
    const { members, per_price, priceData } = this.state;
    for (let i = 0; i < members.length; i++) {
      const player = members[i];
      for (let j = 0; j < data.length; j++) {
        const item = data[j];
        if (item.id === player.id) {
          player.checked = event.target.checked;
        }
      }
    }
    this.setState({
      price: (members.filter(item => item.checked === true).length * per_price).toFixed(2)
    });
    this.setState({
      price: members.filter(item => item.checked === true).length * per_price,
      members,
      payMembers: members.filter(item => item.checked === true),
      priceData
    });
  }

  handlePayNow() {
    const { payMembers, per_price } = this.state;
    if (per_price) {
      if (payMembers && payMembers.length > 0) {
        this.setState({
          pay_status: true
        });
      } else {
        window.alert('You should select at least one judoka!');
      }
    } else {
      window.alert('Your National Federation manager should set per price!');
    }
  }

  handleBackTable() {
    const { player_list } = this.state;
    for (let i = 0; i < player_list.length; i++) {
      const player = player_list[i];
      player.checked = false;
    }
    this.setState({
      pay_status: false,
      members: player_list,
      payMembers: null,
      isSubmitting: false,
      filter_members: {
        search: '',
        club: '',
        region: '',
        gender: null,
        weight: null,
        dan: null
      }
    });
  }

  loadStripe() {
    if (!window.document.getElementById('stripe-script')) {
      const s = window.document.createElement('script');
      s.id = 'stripe-script';
      s.type = 'text/javascript';
      s.src = 'https://js.stripe.com/v2/';
      s.onload = () => {
        window.Stripe.setPublishableKey(`${ENV.STRIPE_KEY}`);
      };
      window.document.body.appendChild(s);
    }
  }

  async directPay(params) {
    if (params.card_info) {
      const data = await Api.post('pay-now', params);
      const { response, body } = data;
      switch (response.status) {
        case 200:
          this.setState({
            alertVisible: true,
            messageStatus: true,
            isSubmitting: false,
            successMessage: body.message
          });
          setTimeout(() => {
            this.getMembers();
          }, 4000);
          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isSubmitting: false,
            failMessage: body.message
          });
          break;
        default:
          break;
      }
    } else {
      this.setState({
        alertVisible: true,
        messageStatus: false,
        isSubmitting: false,
        failMessage: params.error
      });
    }
    setTimeout(() => {
      this.setState({ alertVisible: false });
    }, 5000);
  }

  async handlePay() {
    this.setState({
      isSubmitting: true
    });
    const {
      user, pay_method, payMembers, price, priceData
    } = this.state;
    const params = {};
    params.payer_id = user.id;
    params.club_id = user.organization_id;
    params.pay_method = pay_method;
    params.members = payMembers.map(item => item.id);
    params.amount = price;
    params.pay_info = priceData;
    if (pay_method === 'basic_card') {
      params.price_data = priceData;
      const exp_date = priceData.card_expiry_date.split(' / ');
      const number = priceData.card_number.replace(' ', '');
      window.Stripe.card.createToken({
        number,
        exp_month: exp_date[0],
        exp_year: exp_date[1].slice(-2),
        cvc: priceData.card_cvc,
        name: priceData.card_name
      }, (status, response) => {
        if (status === 200) {
          params.card_info = response;
          this.directPay(params);
        } else {
          params.card_info = null;
          params.error = response.error.message;
          this.directPay(params);
        }
      });
    } else if (pay_method === 'payme') {
      localStorage.setItem('payme_data', JSON.stringify(params));
    }
  }

  handleDetailPlayer(id) {
    this.props.history.push('/member/detail', id);
  }

  handleSearchFilter(type, value) {
    const { filter_data, filter_members } = this.state;
    let filtered = [];
    filter_members[type] = value;

    if (filter_members.weight && filter_members.weight.weight === 'All') {
      filter_members.weight = null;
    }
    if (filter_members.gender && filter_members.gender.value === 0) {
      filter_members.gender = null;
    }
    if (filter_members.dan && filter_members.dan.value === '') {
      filter_members.dan = null;
    }
    this.setState({
      filter_members
    });
    filtered = filter_data.filter(
      obj => obj.name.toUpperCase().includes(filter_members.search.toUpperCase()) || obj.surname.toUpperCase().includes(filter_members.search.toUpperCase())
    );
    if (filter_members.region === 'All' || filter_members.region === '') {
      if (!filter_members.search) {
        if (filter_members.gender) {
          if (filter_members.weight && filter_members.weight.weight) {
            if (filter_members.dan && filter_members.dan.value) {
              this.setState({
                members: filter_data.filter(player => player.gender == filter_members.gender.value && player.weight == filter_members.weight.weight && player.dan == filter_members.dan.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
              });
            } else {
              this.setState({
                members: filter_data.filter(player => player.gender == filter_members.gender.value && player.weight == filter_members.weight.weight && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
              });
            }
          } else if (filter_members.dan && filter_members.dan.value) {
            this.setState({
              members: filter_data.filter(player => player.gender == filter_members.gender.value && player.dan == filter_members.dan.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
            });
          } else {
            this.setState({
              members: filter_data.filter(player => player.gender == filter_members.gender.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
            });
          }
        } else if (filter_members.weight && filter_members.weight.weight) {
          if (filter_members.dan && filter_members.dan.value) {
            this.setState({
              members: filter_data.filter(player => player.weight == filter_members.weight.weight && player.dan == filter_members.dan.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
            });
          } else {
            this.setState({
              members: filter_data.filter(player => player.weight == filter_members.weight.weight && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
            });
          }
        } else if (filter_members.dan && filter_members.dan.value) {
          this.setState({
            members: filter_data.filter(player => player.dan == filter_members.dan.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        } else {
          this.setState({
            members: filter_data.filter(player => player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        }
      } else if (filter_members.gender) {
        if (filter_members.weight && filter_members.weight.weight) {
          if (filter_members.dan && filter_members.dan.value) {
            this.setState({
              members: filtered.filter(player => player.gender == filter_members.gender.value && player.weight == filter_members.weight.weight && player.dan == filter_members.dan.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
            });
          } else {
            this.setState({
              members: filtered.filter(player => player.gender == filter_members.gender.value && player.weight == filter_members.weight.weight && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
            });
          }
        } else if (filter_members.dan && filter_members.dan.value) {
          this.setState({
            members: filtered.filter(player => player.gender == filter_members.gender.value && player.dan == filter_members.dan.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        } else {
          this.setState({
            members: filtered.filter(player => player.gender == filter_members.gender.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        }
      } else if (filter_members.weight && filter_members.weight.weight) {
        if (filter_members.dan && filter_members.dan.value) {
          this.setState({
            members: filtered.filter(player => player.weight == filter_members.weight.weight && player.dan == filter_members.dan.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        } else {
          this.setState({
            members: filtered.filter(player => player.weight == filter_members.weight.weight && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        }
      } else if (filter_members.dan && filter_members.dan.value) {
        this.setState({
          members: filtered.filter(player => player.dan == filter_members.dan.value && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
        });
      } else {
        this.setState({
          members: filtered.filter(player => player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
        });
      }
    } else if (!filter_members.search) {
      if (filter_members.gender) {
        if (filter_members.weight && filter_members.weight.weight) {
          if (filter_members.dan && filter_members.dan.value) {
            this.setState({
              members: filter_data.filter(player => player.gender == filter_members.gender.value && player.weight == filter_members.weight.weight && player.dan == filter_members.dan.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
            });
          } else {
            this.setState({
              members: filter_data.filter(player => player.gender == filter_members.gender.value && player.weight == filter_members.weight.weight && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
            });
          }
        } else if (filter_members.dan && filter_members.dan.value) {
          this.setState({
            members: filter_data.filter(player => player.gender == filter_members.gender.value && player.dan == filter_members.dan.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        } else {
          this.setState({
            members: filter_data.filter(player => player.gender == filter_members.gender.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        }
      } else if (filter_members.weight && filter_members.weight.weight) {
        if (filter_members.dan && filter_members.dan.value) {
          this.setState({
            members: filter_data.filter(player => player.weight == filter_members.weight.weight && player.dan == filter_members.dan.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        } else {
          this.setState({
            members: filter_data.filter(player => player.weight == filter_members.weight.weight && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        }
      } else if (filter_members.dan && filter_members.dan.value) {
        this.setState({
          members: filter_data.filter(player => player.dan == filter_members.dan.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
        });
      } else {
        this.setState({
          members: filter_data.filter(player => player.club.toUpperCase().includes(filter_members.club.toUpperCase()) && player.region.toUpperCase().includes(filter_members.region.toUpperCase()))
        });
      }
    } else if (filter_members.gender) {
      if (filter_members.weight && filter_members.weight.weight) {
        if (filter_members.dan && filter_members.dan.value) {
          this.setState({
            members: filtered.filter(player => player.gender == filter_members.gender.value && player.weight == filter_members.weight.weight && player.dan == filter_members.dan.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        } else {
          this.setState({
            members: filtered.filter(player => player.gender == filter_members.gender.value && player.weight == filter_members.weight.weight && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
          });
        }
      } else if (filter_members.dan && filter_members.dan.value) {
        this.setState({
          members: filtered.filter(player => player.gender == filter_members.gender.value && player.dan == filter_members.dan.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
        });
      } else {
        this.setState({
          members: filtered.filter(player => player.gender == filter_members.gender.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
        });
      }
    } else if (filter_members.weight && filter_members.weight.weight) {
      if (filter_members.dan && filter_members.dan.value) {
        this.setState({
          members: filtered.filter(player => player.weight == filter_members.weight.weight && player.dan == filter_members.dan.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
        });
      } else {
        this.setState({
          members: filtered.filter(player => player.weight == filter_members.weight.weight && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
        });
      }
    } else if (filter_members.dan && filter_members.dan.value) {
      this.setState({
        members: filtered.filter(player => player.dan == filter_members.dan.value && player.region.toUpperCase().includes(filter_members.region.toUpperCase()) && player.club.toUpperCase().includes(filter_members.club.toUpperCase()))
      });
    } else {
      this.setState({
        members: filtered.filter(player => player.club.toUpperCase().includes(filter_members.club.toUpperCase()) && player.region.toUpperCase().includes(filter_members.region.toUpperCase()))
      });
    }
  }

  getWeights(gender) {
    const { weights } = this.state;
    return weights.filter((weight) => {
      if (`${gender}` == '0') {
        return true;
      }
      return `${weight.gender}` == `${gender}`;
    });
  }

  render() {
    const {
      user,
      weights,
      orgs,
      payMembers,
      pay_status,
      members,
      filter_members,
      price,
      priceData,
      isSubmitting,
      pay_method,
      is_club_member,
      is_nf
    } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content detail has-hand-card">
          {
            !pay_status ? (
              <Container fluid>
                <div className="text-center mb-4">
                  {
                    members && members.length > 0 && !is_nf ? (
                      <Button
                        type="button"
                        color="success"
                        onClick={this.handlePayNow.bind(this)}
                      >
                        Pay Today
                      </Button>
                    ) : ('')
                  }
                  {
                    (members !== null && members.length === 0) && (
                      <h3 className="text-center text-danger">
                        There is no player for pay now.
                      </h3>
                    )
                  }
                </div>
                <Row>
                  <Col lg="2" md="3" sm="4">
                    <FormGroup>
                      <Input
                        value={(filter_members && filter_members.search) || ''}
                        placeholder="Search Name"
                        onChange={(event) => { this.handleSearchFilter('search', event.target.value); }}
                      />
                    </FormGroup>
                  </Col>
                  {
                    !is_club_member && (
                      <Col lg="2" md="3" sm="4">
                        <FormGroup>
                          <Input
                            className="club-list"
                            list="orgs"
                            name="search_name"
                            type="text"
                            value={filter_members.region || ''}
                            placeholder="Regional Federation Name"
                            onChange={event => this.handleSearchFilter('region', event.target.value)}
                          />
                          <datalist id="orgs">
                            {orgs}
                          </datalist>
                        </FormGroup>
                      </Col>
                    )
                  }
                  {
                    !is_club_member && (
                      <Col lg="2" md="3" sm="4">
                        <FormGroup>
                          <Input
                            value={(filter_members && filter_members.club) || ''}
                            placeholder="Search Club"
                            onChange={(event) => { this.handleSearchFilter('club', event.target.value); }}
                          />
                        </FormGroup>
                      </Col>
                    )
                  }
                  <Col lg="2" md="3" sm="4">
                    <FormGroup>
                      <Select
                        name="search_gender"
                        classNamePrefix="react-select-lg"
                        placeholder="All Gender"
                        value={filter_members && filter_members.gender}
                        options={search_genders}
                        getOptionValue={option => option.value}
                        getOptionLabel={option => option.label}
                        onChange={(gender) => {
                          this.handleSearchFilter('gender', gender);
                        }}
                      />
                    </FormGroup>
                  </Col>
                  {
                    weights && weights.length > 0 && (
                      <Col lg="2" md="3" sm="4">
                        <FormGroup>
                          <Select
                            name="search_weight"
                            classNamePrefix="react-select-lg"
                            placeholder="All Weight"
                            value={filter_members && filter_members.weight}
                            options={filter_members.gender ? (this.getWeights(filter_members.gender ? filter_members.gender.value : '')) : weights}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => `${option.weight} Kg`}
                            onChange={(weight) => {
                              this.handleSearchFilter('weight', weight);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )
                  }
                  <Col lg="2" md="3" sm="4">
                    <FormGroup>
                      <Select
                        name="search_dan"
                        classNamePrefix="react-select-lg"
                        placeholder="All Dan"
                        value={filter_members && filter_members.dan}
                        options={Dans}
                        getOptionValue={option => option.value}
                        getOptionLabel={option => option.label}
                        onChange={(dan) => {
                          this.handleSearchFilter('dan', dan);
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <div className="table-responsive mb-3">
                  {
                    members !== null && (
                      <PayerTable
                        items={members}
                        filter={filter_members}
                        onSelect={this.handleSelectPlayer.bind(this)}
                        onSelectAll={this.handleSelectAll.bind(this)}
                        onDetail={this.handleDetailPlayer.bind(this)}
                      />
                    )
                  }
                </div>
              </Container>
            ) : (
              <Container>
                {
                  payMembers && payMembers.length > 0 && (
                    <h3 className="text-center text-warning mb-5">
                      {`You are able to pay for ${payMembers.length} ${payMembers.length === 1 ? 'player' : 'members'} now.`}
                    </h3>
                  )
                }
                <Alert color={this.state.messageStatus ? 'success' : 'danger'} isOpen={this.state.alertVisible}>
                  {
                    this.state.messageStatus ? this.state.successMessage : this.state.failMessage
                  }
                </Alert>
                {
                  price !== 0 && (
                    <div>
                      <Nav tabs>
                        {
                          user.country !== 'uz' && (
                            <NavItem>
                              <NavLink
                                className={classnames({ active: pay_method === 'basic_card' })}
                                onClick={() => { this.setState({ pay_method: 'basic_card' }); }}
                              >
                                <div className="payments">
                                  <Image src={Bitmaps.visa} />
                                  <Image src={Bitmaps.mastercard} />
                                  <Image src={Bitmaps.amex} />
                                  <Image src={Bitmaps.discover} />
                                  <Image src={Bitmaps.jcb} />
                                </div>
                              </NavLink>
                            </NavItem>
                          )
                        }
                        {
                          user.country === 'uz' && (
                            <NavItem>
                              <NavLink
                                className={classnames({ active: pay_method === 'payme' })}
                                onClick={() => { this.setState({ pay_method: 'payme' }); }}
                              >
                                <div className="payment">
                                  <Image src={Bitmaps.payme} />
                                </div>
                              </NavLink>
                            </NavItem>
                          )
                        }
                      </Nav>
                      <TabContent activeTab={user.country === 'uz' ? 'payme' : 'basic_card'}>
                        <TabPane tabId="basic_card">
                          <Card
                            container="card_container"
                            formInputsNames={{
                              number: 'card_number',
                              expiry: 'card_expiry_date',
                              cvc: 'card_cvc',
                              name: 'card_name'
                            }}
                            classes={{
                              valid: 'valid',
                              invalid: 'invalid'
                            }}
                            initialValues={
                              {
                                number: priceData.card_number,
                                cvc: priceData.card_cvc,
                                expiry: priceData.card_expiry_date,
                                name: priceData.card_name
                              }
                            }
                          >
                            <Row className="d-flex flex-column flex-md-row bg-info">
                              <Col md="6" className="align-self-center">
                                <div id="card_container" />
                              </Col>
                              <Col md="6" className="bg-light p-3">
                                <Form>
                                  <FormGroup>
                                    <Label for="price">Pay Today</Label>
                                    <span className="d-block">
                                      Total :
                                      {' '}
                                      {price ? `${price} KZT` : null}
                                    </span>
                                  </FormGroup>
                                  <FormGroup>
                                    <Label for="card_name">Name on card</Label>
                                    <Input
                                      type="text"
                                      name="card_name"
                                      id="card_name"
                                      onChange={this.handleChangeCardInfo.bind(this, 'card_name')}
                                    />
                                    {isSubmitting && !priceData.card_name && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                                  </FormGroup>

                                  <Row>
                                    <Col md="9">
                                      <FormGroup>
                                        <Label for="card_number">Card number</Label>
                                        <Input
                                          type="text"
                                          name="card_number"
                                          id="card_number"
                                          onChange={this.handleChangeCardInfo.bind(this, 'card_number')}
                                        />
                                        {isSubmitting && !priceData.card_number && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                                      </FormGroup>
                                    </Col>
                                    <Col md="3">
                                      <FormGroup>
                                        <Label for="card_cvc">CVC</Label>
                                        <Input
                                          type="text"
                                          name="card_cvc"
                                          id="card_cvc"
                                          onChange={this.handleChangeCardInfo.bind(this, 'card_cvc')}
                                        />
                                        {isSubmitting && !priceData.card_cvc && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                                      </FormGroup>
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col md="6">
                                      <FormGroup>
                                        <Label for="card_expiry_date">Card expiry date</Label>
                                        <Input
                                          type="text"
                                          name="card_expiry_date"
                                          id="card_expiry_date"
                                          onChange={this.handleChangeCardInfo.bind(this, 'card_expiry_date')}
                                        />
                                        {isSubmitting && !priceData.card_expiry_date && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                                      </FormGroup>
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col md="12">
                                      <Button
                                        className="btn btn-outline-primary float-left"
                                        type="button"
                                        onClick={this.handleBackTable.bind(this)}>
                                        Back
                                      </Button>
                                      <Button
                                        className="float-right"
                                        type="button"
                                        color="primary"
                                        disabled={isSubmitting || !priceData.card_name || !priceData.card_number || !priceData.card_cvc || !priceData.card_expiry_date}
                                        onClick={this.handlePay.bind(this)}
                                      >
                                        {isSubmitting && (<i className="fas fa-sync fa-spin mr-3" />)}
                                        Pay Now
                                      </Button>
                                    </Col>
                                  </Row>

                                </Form>
                              </Col>
                            </Row>
                          </Card>
                        </TabPane>
                        <TabPane tabId="payme">
                          <Row className="d-flex flex-column flex-md-row bg-info">
                            <Col md="6" className="bg-light p-3">
                              <FormGroup>
                                <Label for="price">Pay Today</Label>
                                <span className="d-block">
                                  Total :
                                  {' '}
                                  {price ? `${price} UZS` : null}
                                </span>
                              </FormGroup>
                              <Row>
                                <Col md="12">
                                  <Button
                                    className="btn btn-outline-primary float-left"
                                    type="button"
                                    onClick={this.handleBackTable.bind(this)}>
                                    Back
                                  </Button>
                                </Col>
                              </Row>
                            </Col>
                            <Col md="6" className="d-flex justify-content-center align-items-center">
                              <Form method="POST" action="https://checkout.paycom.uz">
                                <Input type="hidden" name="merchant" value={ENV.MERCHANT_KEY} />
                                <Input type="hidden" name="amount" value={price * 100} />
                                <Input type="hidden" name="account[customer_name]" value="Membership fee" />
                                <Button
                                  type="submit"
                                  onClick={this.handlePay.bind(this)}
                                  style={{
                                    cursor: 'pointer',
                                    border: '1px solid #ebebeb',
                                    borderRadius: '6px',
                                    background: 'linear-gradient(to top, #f1f2f2, white)',
                                    width: '200px',
                                    height: '42px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <img style={{ width: '160px', height: '20px' }} src="http://cdn.payme.uz/buttons/button_big_EN.svg" />
                                </Button>
                              </Form>
                            </Col>
                          </Row>
                        </TabPane>
                      </TabContent>
                    </div>
                  )
                }
              </Container>
            )
          }
          <div className={pay_status ? 'hand-card right-handle' : 'hand-card'} />
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Payment);