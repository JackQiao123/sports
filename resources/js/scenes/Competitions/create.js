/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Row, Col,
  Form, FormGroup, FormFeedback,
  Input, Label,
  Button, 
  UncontrolledAlert,
  Alert
} from 'reactstrap';
import Select from 'react-select';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

import { CompetitionType, CompetitionLevel, search_genders } from '../../configs/data';

class CreateComp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      creator_id: '',
      is_nf: '',
      user_level: '',
      from: null,
      to: null,
      register_from: null,
      register_to: null,
      weight_list: [],
      weight_origin: [],
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: ''
    };

    this.formikRef = React.createRef();
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));

    this.setState({
      creator_id: user.user.member_info.organization_id,
      is_nf: user.user.is_nf,
      user_level: user.user.level
    });

    const weight_list = await Api.get('weights');
    switch (weight_list.response.status) {
      case 200:
        this.setState({
          weight_origin: weight_list.body
        });
        break;
      default:
        break;
    }
  }

  onChangeFrom(event, data) {
    if (data.value) {
      let from = this.convertDate(data.value);

      this.setState({
        from
      });
    } else {
      this.setState({
        from: null
      });
    }
  }

  onChangeTo(event, data) {
    if (data.value) {
      let to = this.convertDate(data.value);

      this.setState({
        to
      });
    } else {
      this.setState({
        to: null
      });
    }
  }

  onChangeRegisterFrom(event, data) {
    if (data.value) {
      let register_from = this.convertDate(data.value);

      this.setState({
        register_from
      });
    } else {
      this.setState({
        register_from: null
      });
    }
  }

  onChangeRegisterTo(event, data) {
    if (data.value) {
      let register_to = this.convertDate(data.value);

      this.setState({
        register_to
      });
    } else {
      this.setState({
        register_to: null
      });
    }
  }

  convertDate(d) {
    let year = d.getFullYear();

    let month = d.getMonth() + 1;
    if (month < 10)
      month = '0' + month;

    let day = d.getDate();
    if (day < 10)
      day = '0' + day;

    return (year + '-' + month + '-' + day);
  }

  async handleSubmit(values, bags) {
    if (!this.state.from || !this.state.to) {
      bags.setSubmitting(false);
      return;
    }

    if (!this.state.register_from || !this.state.register_to) {
      bags.setSubmitting(false);
      return;
    }
    
    let newData = {};

    let weight_ids = '';
    for (let i = 0; i < values.weights.length; i++) {
      weight_ids += values.weights[i].id + ',';
    }
    
    newData = {
      creator_id: this.state.creator_id,
      name: values.name,
      short_name: values.short_name,
      place: values.place,
      type: this.state.is_nf == 1 ? values.type.value : CompetitionType.filter(type => type.value == 'reg')[0].value,
      level: values.level.value,
      from: this.state.from,
      to: this.state.to,
      register_from: this.state.register_from,
      register_to: this.state.register_to,
      legal_birth_from: values.legal_birth_from.value,
      legal_birth_to: values.legal_birth_to.value,
      gender: values.gender.value,
      weights: weight_ids.substring(0, weight_ids.length - 1)
    }

    const data = await Api.post('reg-competition', newData);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          successMessage: 'Added Successfully!'
        });

        setTimeout(() => {
          this.setState({ alertVisible: false });
          this.props.history.push('/competitions');
        }, 2000);
        break;
      case 406:
        if (body.message) {
          bags.setStatus({
            color: 'danger',
            children: body.message
          });
        }
        break;
      case 422:
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  render() {
    const {
      from, to, is_nf,
      register_from, register_to,
      weight_list, weight_origin
    } = this.state;

    let d = new Date();
    let year = d.getFullYear();

    let years = [];
    for (let i = year - 10; i > 1950 ; i--) {
      years.push({label: i, value: i});
    }

    const colourStyles = {
      control: styles => ({ ...styles, backgroundColor: 'white' }),
      option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        return {
          ...styles,
          backgroundColor: isDisabled
            ? null
            : isSelected
            ? data.gender == 1 ? '#635FA3 !important' : '#DC3545 !important'
            : isFocused
            ? '#e2e2e2'
            : null,
          color: 'black'
        };
      },
      multiValue: (styles, { data }) => {
        return {
          ...styles,
          backgroundColor: data.gender == 1 ? '#635FA3 !important' : '#DC3545 !important'
        };
      },
      multiValueLabel: (styles) => ({
        ...styles,
        color: 'white',
      }),
      multiValueRemove: (styles) => ({
        ...styles,
        color: 'white'
      }),
    }

    return(
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container>
            <div className="w-100 mb-5">
              <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
                {
                  this.state.messageStatus ? this.state.successMessage : this.state.failMessage
                }
              </Alert>
            </div>
            <Formik
              ref={this.formikRef}

              initialValues={{
                creator_id: null,
                type: '',
                level: '',
                name: '',
                short_name: '',
                place: '',
                from: null,
                to: null,
                register_from: null,
                register_to: null,
                legal_birth_from: null,
                legal_birth_to: null,
                gender: null,
                weights: null
              }}

              validationSchema={
                Yup.object().shape({
                  level: Yup.mixed().required('This field is required!'),
                  name: Yup.mixed().required('This field is required!'),
                  short_name: Yup.mixed().required('This field is required!'),
                  place: Yup.mixed().required('This field is required!'),
                })
              }

              onSubmit={this.handleSubmit.bind(this)}

              render={({
                values,
                errors,
                status,
                touched,
                setFieldValue,
                handleBlur,
                handleChange,
                handleSubmit,
                isSubmitting
              }) => (
                <Form onSubmit={handleSubmit}>
                  {status && <UncontrolledAlert {...status} />}
                  <Row>
                    {
                      is_nf == 1 ? (
                        <Fragment>
                          <Col xs="12" sm="6">
                            <FormGroup>
                              <Label for="type">Competition Type</Label>
                              <Select
                                name="type"
                                classNamePrefix={!values.type && touched.type ? 'invalid react-select-lg' : 'react-select-lg'}
                                indicatorSeparator={null}
                                options={CompetitionType.filter(type => type.value == 'inter' || type.value == 'nf')}
                                getOptionValue={option => option.value}
                                getOptionLabel={option => option.label}
                                value={values.type}
                                onChange={(value) => {
                                  setFieldValue('type', value);
                                }}
                                onBlur={this.handleBlur}
                              />
                              {!values.type && touched.type && (
                                <FormFeedback className="d-block">This field is required!</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                          <Col xs="12" sm="6">
                            <FormGroup>
                              <Label for="level">Competition Level</Label>
                              <Select
                                name="level"
                                classNamePrefix={!values.level && touched.level ? 'invalid react-select-lg' : 'react-select-lg'}
                                indicatorSeparator={null}
                                options={CompetitionLevel}
                                getOptionValue={option => option.value}
                                getOptionLabel={option => option.label}
                                value={values.level}
                                onChange={(level) => {
                                  setFieldValue('level', level);

                                  setFieldValue('weights', '');

                                  let weight_list = [];

                                  if (level.value == 'senior' || level.value == 'junior') {
                                    weight_list = weight_origin.filter(weight => weight.type == 'senior-junior');
                                  } else {
                                    weight_list = weight_origin.filter(weight => weight.type == 'cadet');
                                  }
                                  
                                  this.setState({
                                    weight_list
                                  });
                                }}
                                onBlur={this.handleBlur}
                              />
                              {!values.level && touched.level && (
                                <FormFeedback className="d-block">This field is required!</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <Col xs="12" sm="6">
                            <FormGroup>
                              <Label for="level">Competition Level</Label>
                              <Select
                                name="level"
                                classNamePrefix={!values.level && touched.level ? 'invalid react-select-lg' : 'react-select-lg'}
                                indicatorSeparator={null}
                                options={CompetitionLevel}
                                getOptionValue={option => option.value}
                                getOptionLabel={option => option.label}
                                value={values.level}
                                onChange={(level) => {
                                  setFieldValue('level', level);
                                  
                                  setFieldValue('weights', '');

                                  let weight_list = [];

                                  if (level.value == 'senior' || level.value == 'junior') {
                                    weight_list = weight_origin.filter(weight => weight.type == 'senior-junior');
                                  } else {
                                    weight_list = weight_origin.filter(weight => weight.type == 'cadet');
                                  }
                                  
                                  this.setState({
                                    weight_list
                                  });
                                }}
                                onBlur={this.handleBlur}
                              />
                              {!values.level && touched.level && (
                                <FormFeedback className="d-block">This field is required!</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                          <Col xs="12" sm="6"></Col>
                        </Fragment>
                      )
                    }
                    <Col xs="12" sm="6">
                      <FormGroup>
                        <Label for="name">Competition Name</Label>
                        <Input
                          name="name"
                          type="text"
                          value={values.name || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.name && touched.name}
                        />
                        <FormFeedback>{errors.name}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup>
                        <Label for="short_name">Competition Short Name</Label>
                        <Input
                          name="short_name"
                          type="text"
                          value={values.short_name || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.short_name && touched.short_name}
                        />
                        <FormFeedback>{errors.short_name}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col xs="12">
                      <FormGroup>
                        <Label for="place">Competition Place</Label>
                        <Input
                          name="place"
                          type="text"
                          value={values.place || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.place && touched.place}
                        />
                        <FormFeedback>{errors.place}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!from && touched.from ? 'invalid calendar' : 'calendar'}>
                        <Label for="from">From</Label>
                        <SemanticDatepicker
                          name="from"
                          placeholder="From"
                          onChange={this.onChangeFrom.bind(this)}
                        />
                        {!from && touched.from && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!to && touched.to ? 'invalid calendar' : 'calendar'}>
                        <Label for="to">To</Label>
                        <SemanticDatepicker
                          name="to"
                          placeholder="To"
                          onChange={this.onChangeTo.bind(this)}
                        />
                        {!to && touched.to && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!register_from && touched.register_from ? 'invalid calendar' : 'calendar'}>
                        <Label for="register_from">Registration From</Label>
                        <SemanticDatepicker
                          name="register_from"
                          placeholder="Registration From"
                          onChange={this.onChangeRegisterFrom.bind(this)}
                        />
                        {!register_from && touched.register_from && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!register_to && touched.register_to ? 'invalid calendar' : 'calendar'}>
                        <Label for="register_to">Registration To</Label>
                        <SemanticDatepicker
                          name="register_to"
                          placeholder="Registration To"
                          onChange={this.onChangeRegisterTo.bind(this)}
                        />
                        {!register_to && touched.register_to && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label for="legal_birth_from">Legal Date of Birth (Min)</Label>
                        <Select
                          name="legal_birth_from"
                          classNamePrefix={
                            !values.legal_birth_from && touched.legal_birth_from ? 'invalid react-select-lg' : 'react-select-lg'
                          }
                          indicatorSeparator={null}
                          options={years}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          value={values.legal_birth_from}
                          onChange={(value) => {
                            setFieldValue('legal_birth_from', value);
                          }}
                          onBlur={this.handleBlur}
                        />
                        {!values.legal_birth_from && touched.legal_birth_from && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label for="legal_birth_to">Legal Date of Birth (Max)</Label>
                        <Select
                          name="legal_birth_to"
                          classNamePrefix={
                            !values.legal_birth_to && touched.legal_birth_to ? 'invalid react-select-lg' : 'react-select-lg'
                          }
                          indicatorSeparator={null}
                          options={years}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          value={values.legal_birth_to}
                          onChange={(value) => {
                            setFieldValue('legal_birth_to', value);
                          }}
                          onBlur={this.handleBlur}
                        />
                        {!values.legal_birth_to && touched.legal_birth_to && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="gender">Gender</Label>
                        <Select
                          name="gender"
                          classNamePrefix={!values.gender && touched.gender ? 'invalid react-select-lg' : 'react-select-lg'}
                          indicatorSeparator={null}
                          options={search_genders}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          value={values.gender}
                          onChange={(value) => {
                            setFieldValue('gender', value);

                            value && value.value != 0 ? (
                              setFieldValue('weights', weight_list.filter(weight => weight.gender == value.value))
                            )
                            : setFieldValue('weights', weight_list.filter(weight => weight.gender != 0));
                          }}
                          onBlur={this.handleBlur}
                        />
                        {!values.gender && touched.gender && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="8">
                      <FormGroup>
                        <Label for="weights">Weight Category</Label>
                        <Select
                          name="weights"
                          classNamePrefix={!values.weights && touched.weights ? 'invalid react-select-lg' : 'react-select-lg'}
                          placeholder="Weight"
                          menuPlacement="auto"
                          isMulti
                          options={
                            values.gender && values.gender.value != 0 ? 
                              weight_list.filter(weight => weight.gender == values.gender.value) 
                            : weight_list.filter(weight => weight.gender != 0)
                          }
                          getOptionValue={option => option.id}
                          getOptionLabel={option => `${option.weight} Kg`}
                          value={values.weights}
                          onChange={(weight) => {
                            setFieldValue('weights', weight);
                          }}
                          styles={colourStyles}
                        />
                        {!values.weights && touched.weights && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  <div className="w-100 d-flex justify-content-end">
                    <div>
                      <Button
                        className="mr-5"
                        disabled={isSubmitting}
                        type="submit"
                        color="primary"
                      >
                        Create
                      </Button>
                      <Button
                        type="button"
                        color="secondary"
                        onClick={() => this.props.history.push('/')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            />
          </Container>
        </div>
      </Fragment>
    )
  }
}

export default CreateComp;