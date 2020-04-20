/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import moment from 'moment';
import * as Yup from 'yup';
import {
  Container,
  Row, Col,
  Button,
  Form, FormGroup, FormFeedback,
  Input, Label,
  UncontrolledAlert,
  UncontrolledTooltip ,
  Alert
} from 'reactstrap';
import Select from 'react-select';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import { OrganizationType, referee_type_options, Genders, Dans } from '../../configs/data';

class MemberAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parent_id: '',
      country: '',
      level: '',
      user_is_club: false,
      imagePreviewUrl: '',
      fileKey: 1,
      org_list: [],
      club_list: [],
      weights: [],
      init_weights: [],
      roles: [],
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
    };
    this.fileRef = React.createRef();
    this.formikRef = React.createRef();
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const parent_id = user.user.member_info.organization_id;
    const country = user.user.country;
    const level = user.user.level;
    const user_is_club = user.user.is_club_member == 1 && true;
    
    this.setState({
      parent_id,
      country,
      level,
      user_is_club
    });

    const org_response = await Api.get(`organization-list/${parent_id}`);
    const { response, body } = org_response;
    switch (response.status) {
      case 200:
        if (body.length > 0 && body[0].parent_id == 0)
          body[0].name_o = "National Federation";

        this.setState({
          org_list: body
        });

        break;
      default:
        break;
    }

    const club_response = await Api.get(`club-list/${parent_id}`);
    switch (club_response.response.status) {
      case 200:
        this.setState({
          club_list: club_response.body
        });
        
        break;
      default:
        break;
    }

    const weight_list = await Api.get('weights');
    switch (weight_list.response.status) {
      case 200:
        this.setState({
          weights: weight_list.body,
          init_weights: weight_list.body
        });

        break;
      default:
        break;
    }

    const role_lists = JSON.parse(localStorage.getItem('roles'));
    if (role_lists && role_lists.length > 0) {
      this.setState({
        roles: role_lists
      });
    } else {
      const role_list = await Api.get('roles');
      switch (role_list.response.status) {
        case 200:
          this.setState({
            roles: role_list.body
          });

          if (role_list.body.length > 0) {
            localStorage.setItem('roles', JSON.stringify(role_list.body));
          }

          break;
        default:
          break;
      }
    }
  }

  fileUpload(e) {
    e.preventDefault();
    const reader = new FileReader();
    
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        imagePreviewUrl: reader.result
      });
    };

    reader.readAsDataURL(file);
  }

  async handleSubmit(values, bags) {
    if (values.role_id && values.role_id.id == 1 && ((!values.organization_type) || values.position == '' )) {
      bags.setSubmitting(false);
      return;
    }
    
    if (values.role_id && values.role_id.id == 1 && values.organization_type.value == 'ref' && 
        (!values.organization_id || values.position == '')) {
      bags.setSubmitting(false);
      return;
    }
    
    if (values.role_id && values.role_id.id == 1 && values.organization_type.value == 'club' && 
        (!values.organization_id || !values.club_id)) {
      bags.setSubmitting(false);
      return;
    }
    
    if (values.role_id && values.role_id.id == 2 && (!values.organization_id || !values.club_id)) {
      bags.setSubmitting(false);
      return;
    }
    
    if (values.role_id && values.role_id.id == 3 && (!values.position.value || !values.organization_id)) {
      bags.setSubmitting(false);
      return;
    }
    
    if (!values.role_id && (!values.weight_id || !values.dan)) {
      bags.setSubmitting(false);
      return;
    }
    
    if (values.role_id && values.role_id.is_player == 1 && 
        (!values.club_id || !values.weight_id || !values.dan || (values.dan && values.dan.value == ''))) {
      bags.setSubmitting(false);
      return;
    }
    
    let newData = {};
    const { imagePreviewUrl } = this.state;
    
    newData = {
      organization_id: values.club_id ? 
        values.club_id.id : 
        (values.organization_id ? values.organization_id.id : this.state.parent_id),
      name: values.name,
      surname: values.surname,
      gender: values.gender.id,
      birthday: moment(values.birthday).format('YYYY-MM-DD'),
      email: values.email,
      country: this.state.country,
      weight_id: values.weight_id ? values.weight_id.id : '',
      dan: values.dan ? values.dan.value : '',
      role_id: values.role_id ? values.role_id.id : 3,
      profile_image: imagePreviewUrl || '',
      position: values.position ? (values.position.value || values.position) : '',
      active: values.is_club || 0,
      register_date: values.register_date
    };

    const data = await Api.post('reg-member', newData);
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
          this.props.history.goBack();
        }, 2000);
        break;
      case 406:
        if (body.message) {
          bags.setStatus({
            color: 'danger',
            children: body.message
          });
        }
        bags.setErrors(body.errors);
        break;
      case 422:
        this.setState({
          alertVisible: true,
          messageStatus: false,
          failMessage: body.data && 
            (`${body.data.email !== undefined ? body.data.email : ''} 
              ${body.data.identity !== undefined ? body.data.identity : ''}`)
        });
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  render() {
    const {
      level,
      user_is_club,
      imagePreviewUrl,
      org_list,
      club_list,
      roles,
      weights,
      init_weights
    } = this.state;

    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }

    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    
    return (
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
                role_id: null,
                organization_type: null,
                organization_id: (level !== null && level != 1) ? level : null,
                club_id: null,
                profile_image: null,
                register_date: [year, month, day].join('-'),
                name: '',
                surname: '',
                gender: null,
                birthday: null,
                email: '',
                weight_id: null,
                dan: null,
                position: ''
              }}

              validationSchema={
                Yup.object().shape({
                  name: Yup.string().required('This field is required!'),
                  surname: Yup.string().required('This field is required!'),
                  gender: Yup.mixed().required('This field is required!'),
                  birthday: Yup.mixed().required('This field is required!'),
                  email: Yup.string().email('Email is not valid!').required('This field is required!')
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
                    <Col xs="12" sm="6">
                      <Row>
                        <Col sm="12">
                        {
                          !user_is_club && (
                            <FormGroup>
                              <Label for="role_id">Role</Label>
                              <Select
                                name="role_id"
                                classNamePrefix={!values.role_id && touched.role_id ? 'invalid react-select-lg' : 'react-select-lg'}
                                indicatorSeparator={null}
                                options={roles}
                                getOptionValue={option => option.id}
                                getOptionLabel={option => option.name}
                                value={values.role_id}
                                invalid={!!errors.role_id && touched.role_id}
                                onChange={(value) => {
                                  setFieldValue('role_id', value);
      
                                  setFieldValue('organization_id', null);
                                  setFieldValue('club_id', null);

                                  if (org_list.length == 1)
                                    setFieldValue('organization_id', org_list[0]);

                                  if (value.id == 1)
                                    setFieldValue('position', '')
                                }}
                                onBlur={this.handleBlur}
                              />
                              {!values.role_id && touched.role_id && (
                                <FormFeedback className="d-block">This field is required!</FormFeedback>
                              )}
                            </FormGroup>
                          )
                        }
                        </Col>
                        <Col sm="12">
                        {
                          values.role_id && values.role_id.id == 1 && (
                            <FormGroup>
                              <Label for="organization_type">Organization Type</Label>
                              <Select
                                name="organization_type"
                                classNamePrefix={
                                  values.role_id && values.role_id.id == 1 &&
                                  !values.organization_type && touched.organization_type ? 
                                  'invalid react-select-lg' : 'react-select-lg'}
                                indicatorSeparator={null}
                                options={
                                  level != 1 ? (
                                    user_is_club ? (
                                      OrganizationType.filter(item => item.value == 'club')
                                    ) : (
                                      OrganizationType.filter(item => item.value != 'nf')
                                    )
                                  ) : (
                                    OrganizationType
                                  )
                                }
                                getOptionValue={option => option.value}
                                getOptionLabel={option => option.label}
                                value={values.organization_type}
                                invalid={!!errors.organization_type && touched.organization_type}
                                onChange={(value) => {
                                  setFieldValue('organization_type', value);

                                  setFieldValue('organization_id', null);
                                  setFieldValue('club_id', null);

                                  if (org_list.length == 1)
                                    setFieldValue('organization_id', org_list[0]);
                                }}
                                onBlur={this.handleBlur}
                              />
                              {
                                values.role_id && values.role_id.id == 1 && 
                                !values.organization_type && touched.organization_type && (
                                  <FormFeedback className="d-block">This field is required!</FormFeedback>
                                )
                              }
                            </FormGroup>
                          )
                        }
                        </Col>
                        <Col sm="12">
                        {
                          !user_is_club && (((values.role_id && values.role_id.id != 1) || 
                            (values.organization_type && values.organization_type.value != 'nf'))) && (
                            <FormGroup>
                              <Label for="organization_id">Regional Federation</Label>
                              <Select
                                name="organization_id"
                                classNamePrefix={
                                  (!values.organization_id || (values.organization_id && values.organization_id == '')) &&
                                    touched.organization_id ? 'invalid react-select-lg' : 'react-select-lg'
                                }
                                options={
                                  values.organization_type && values.organization_type.value == 'ref' 
                                  ? org_list.filter(item => item.parent_id != 0) : org_list
                                }
                                indicatorSeparator={null}
                                getOptionValue={option => option.id}
                                getOptionLabel={option => option.name_o}
                                value={values.organization_id}
                                onChange={(value) => {
                                  setFieldValue('organization_id', value);
                                  setFieldValue('club_id', null);
                                  setFieldValue('addressline1', value.addressline1);
                                  setFieldValue('addressline2', value.addressline2);
                                  setFieldValue('state', value.state);
                                  setFieldValue('city', value.city);
                                }}
                                onBlur={this.handleBlur}
                              />
                              {
                                (!values.organization_id || (values.organization_id && values.organization_id == '')) &&
                                  touched.organization_id && (
                                <FormFeedback className="d-block">This field is required!</FormFeedback>
                                )
                              }
                            </FormGroup>
                          )
                        }
                        </Col>
                        <Col sm="12">
                        {
                          !user_is_club && (((values.role_id && values.role_id.id == 1 &&
                            values.organization_type && values.organization_type.value == 'club') ||
                          (values.role_id && (values.role_id.id == 2 || values.role_id.id == 4)))) && (
                            <FormGroup>
                              <Label for="club_id">Club</Label>
                              <Select
                                name="club_id"
                                classNamePrefix={
                                  (values.role_id && values.role_id.id != 4) &&
                                  (!values.club_id || (values.club_id && values.club_id == '')) &&
                                  touched.club_id ? 
                                  'invalid react-select-lg' : 'react-select-lg'}
                                options={
                                  org_list.length > 1 && values.organization_id && values.organization_id.id != '' ? (
                                    club_list.filter(club => club.parent_id == values.organization_id.id)
                                  ) : club_list
                                }
                                getOptionValue={option => option.id}
                                getOptionLabel={option => option.name_o}
                                value={values.club_id}
                                invalid={values.role_id && values.role_id.id != 4 && touched.club_id}
                                onChange={(value) => {
                                  setFieldValue('club_id', value);
                                  setFieldValue('organization_id', org_list.find(org => org.id == value.parent_id));
                                }}
                                onBlur={this.handleBlur}
                              />
                              {
                                  (values.role_id && values.role_id.id != 4) &&
                                  (!values.club_id || (values.club_id && values.club_id == '')) &&
                                  touched.club_id && (
                                <FormFeedback className="d-block">This field is required!</FormFeedback>
                              )}
                            </FormGroup>
                          )
                        }
                        </Col>
                        <Col sm="12">
                          <FormGroup>
                            <Label for="register_date">Register Date</Label>
                            <Input
                              id="register_date"
                              name="register_date"
                              type="text"
                              value={[year, month, day].join('-')}
                              readOnly
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </Col>                    
                    <Col xs="12" sm="6">
                      <FormGroup className="reg-member">
                        <Label for="profile_image">Profile Image</Label>
                        <Input
                          ref="file"
                          type="file"
                          key={this.state.fileKey}
                          multiple={false}
                          onChange={this.fileUpload.bind(this)}
                        />
                        <div className={imagePreviewUrl ? 'image-preview is_image' : 'image-preview'}>
                          {$imagePreview}
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm="6">
                      <FormGroup>
                        <Label for="name">
                          Name
                        </Label>
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
                    <Col sm="6">
                      <FormGroup>
                        <Label for="surname">
                          Surname
                        </Label>
                        <Input
                          name="surname"
                          type="text"
                          value={values.surname || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.surname && touched.surname}
                        />
                        <FormFeedback>{errors.surname}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="gender">Gender</Label>
                        <Select
                          name="gender"
                          classNamePrefix={!!errors.gender && touched.gender ? 'invalid react-select-lg' : 'react-select-lg'}
                          indicatorSeparator={null}
                          options={Genders}
                          getOptionValue={option => option.id}
                          getOptionLabel={option => option.name}
                          value={values.gender}
                          onChange={(value) => {
                            setFieldValue('gender', value);
                            this.setState({
                              weights: init_weights.filter(obj => obj.gender == value.id)
                            })
                          }}
                          onBlur={this.handleBlur}
                        />
                        {!!errors.gender && touched.gender && (
                          <FormFeedback className="d-block">{errors.gender}</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="birthday">Birthday</Label>
                        <Input
                          id="birthday"
                          name="birthday"
                          type="date"
                          placeholder="YYYY-MM-DD"
                          value={values.birthday || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.birthday && touched.birthday}
                        />
                        <UncontrolledTooltip placement="right" target="birthday">
                          Click triangle icon to select date
                        </UncontrolledTooltip>
                        {!!errors.birthday && touched.birthday && <FormFeedback className="d-block">{errors.birthday}</FormFeedback> }
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="email">Email</Label>
                        <Input
                          name="email"
                          type="email"
                          value={values.email || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.email && touched.email}
                        />
                        <FormFeedback>{errors.email}</FormFeedback>
                      </FormGroup>
                    </Col>
                    {
                      values.role_id && (values.role_id.id == 1 || values.role_id.id == 3) && (
                        <Col xs="6">
                          {
                            values.role_id.id == 1 ? (
                              <FormGroup>
                                <Label for="position">Position</Label>
                                <Input
                                  name="position"
                                  type="text"
                                  value={values.position}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={!values.position && touched.position}
                                />
                                {!values.position && touched.position && (<FormFeedback className="d-block">This field is required!</FormFeedback>)}
                              </FormGroup>
                            ) : (
                              <FormGroup>
                                <Label for="position">Referee Type</Label>
                                <Select
                                  name="position"
                                  classNamePrefix={(!values.position || (values.position && !values.position.value)) && touched.position ? 
                                    'invalid react-select-lg' : 'react-select-lg'}
                                  indicatorSeparator={null}
                                  options={referee_type_options}
                                  getOptionValue={option => option.value}
                                  getOptionLabel={option => option.label}
                                  value={values.position}
                                  onChange={(value) => {
                                    setFieldValue('position', value);
                                  }}
                                  onBlur={this.handleBlur}
                                />
                                {(!values.position || (values.position && !values.position.value)) && touched.position && (
                                  <FormFeedback className="d-block">This field is required!</FormFeedback>)}
                              </FormGroup>
                            )
                          }
                        </Col>
                      )
                    }
                    {
                      (user_is_club || (values.role_id && values.role_id.is_player == 1)) && (
                        <Fragment>
                          <Col sm="6">
                            <FormGroup>
                              <Label for="weight_id">Weight</Label>
                              <Select
                                name="weight_id"
                                menuPlacement="top"
                                classNamePrefix={!values.weight_id && touched.weight_id ? 'invalid react-select-lg' : 'react-select-lg'}
                                value={values.weight_id}
                                options={weights}
                                getOptionValue={option => option.id}
                                getOptionLabel={option => option.weight + " Kg"}
                                onChange={(value) => {
                                  setFieldValue('weight_id', value);
                                }}
                              />
                              {!values.weight_id && touched.weight_id && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                            </FormGroup>
                          </Col>
                          <Col sm="6">
                            <FormGroup>
                              <Label for="dan">Dan</Label>
                              <Select
                                name="dan"
                                menuPlacement="top"
                                classNamePrefix={(!values.dan || (values.dan && values.dan.value == '')) && touched.dan ? 
                                  'invalid react-select-lg' : 'react-select-lg'}
                                value={values.dan}
                                options={Dans}
                                getOptionValue={option => option.value}
                                getOptionLabel={option => option.label}
                                onChange={(value) => {
                                  setFieldValue('dan', value);
                                }}
                              />
                              {(!values.dan || (values.dan && values.dan.value == '')) && touched.dan &&
                                <FormFeedback className="d-block">This field is required!</FormFeedback>}
                            </FormGroup>
                          </Col>
                        </Fragment>
                      )
                    }
                  </Row>
                  <div className="w-100 d-flex justify-content-end">
                    <div>
                      <Button
                        className="mr-5"
                        disabled={isSubmitting}
                        type="submit"
                        color="primary"
                      >
                        Register
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
    );
  }
}

export default MemberAdd;