/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Formik } from 'formik';
import moment from 'moment';
import * as Yup from 'yup';
import {
  Row, Col,
  Modal, ModalBody, ModalHeader,
  Button,
  Form, FormGroup, FormFeedback,
  Input, Label,
  UncontrolledAlert
} from 'reactstrap';
import Select from 'react-select';

import Api from '../apis/app';
import {
  referee_type_options, Genders, Dans, SetSwitch
} from '../configs/data';

class EditModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      isOpen: true,
      org_list: [],
      club_list: [],
      filtered_club: [],
      file: '',
      imagePreviewUrl: '',
      fileKey: 1
    };

    this.fileRef = React.createRef();
    this.formikRef1 = React.createRef();
    this.formikRef2 = React.createRef();
    this.settingValues = this.settingValues.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.getLevel = this.getLevel.bind(this);
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const org_id = user.user.member_info.organization_id;

    if (this.props.type.value !== 'member') {
      const data = await Api.get(`organization-list/${org_id}`);
      const { response, body } = data;
      switch (response.status) {
        case 200:
          this.setState({
            org_list: body
          });

          break;
        case 406:
          break;
        default:
          break;
      }
    }

    this.componentWillReceiveProps(this.props);
  }

  async componentWillReceiveProps(props) {
    const {
      id, type, orgs, clubs
    } = props;
    if (type && type.value && type.value === 'member') {
      const data = await Api.get(`member/${id}`);
      const {
        response, body
      } = data;
      switch (response.status) {
        case 200: {
          this.setState({
            item: body,
            imagePreviewUrl: body.profile_image
          });
          break;
        }
        default:
          break;
      }
    } else {
      const data1 = await Api.get(`organization/${id}`);
      const {
        response, body
      } = data1;
      switch (response.status) {
        case 200: {
          this.setState({
            item: body,
            imagePreviewUrl: body.logo
          });
          break;
        }
        default:
          break;
      }
    }
    if (type.value === 'member') {
      this.setState({
        org_list: orgs,
        club_list: clubs
      });
    }
    this.settingValues(props);
  }

  settingValues(props) {
    const { item, org_list, club_list } = this.state;
    const {
      roles, weights, type
    } = props;
    const {
      formikRef1, formikRef2
    } = this;
    const values = {
      ...item
    };

    if (type && type.value && type.value === 'member') {
      formikRef2.current.setValues({
        name: values.name,
        surname: values.surname,
        gender: values.gender == 1 ? Genders[0] : Genders[1],
        org_id: values.org_id == 1 ? (
          org_list.filter(org => org.id == values.club_id)[0]
        ) : (
          org_list.filter(org => org.id == values.org_id)[0]
        ),
        club_id: club_list.filter(club => club.id == values.club_id)[0],
        role_id: roles.filter(role => role.id == values.role_id)[0],
        profile_image: values.profile_image,
        register_date: values.register_date,
        birthday: values.birthday,
        email: values.email,
        weight_id: weights.filter(weight => weight.id == values.weight_id)[0],
        dan: Dans.filter(dan => dan.value == values.dan)[0],
        identity: values.identity,
        position: values.role_id == 3 ? referee_type_options.filter(option => option.value == values.position) : values.position,
        level: values.level
      });
    } else {
      formikRef1.current.setValues({
        name_o: values.name_o,
        name_s: values.name_s,
        parent_id: org_list.filter(org => org.id == values.parent_id)[0],
        register_no: values.register_no,
        logo: values.logo,
        email: values.email,
        mobile_phone: values.mobile_phone,
        addressline1: values.addressline1,
        addressline2: values.addressline2,
        state: values.state,
        city: values.city,
        zip_code: values.zip_code,
        level: values.level,
        is_club: SetSwitch.filter(set => set.value == values.is_club)[0]
      });
    }
  }

  getLevel(parent_id) {
    const { orgs } = this.props;
    for (let i = 0; i < orgs.length; i++) {
      if (orgs[i].id == parent_id) {
        return orgs[i].level + 1;
      }
    }
    return 0;
  }

  fileUpload(e) {
    e.preventDefault();
    const reader = new FileReader();
    
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file,
        imagePreviewUrl: reader.result
      });
    };

    reader.readAsDataURL(file);
  }

  handleCancel() {
    let {
      handleCancel
    } = this.props;

    handleCancel = handleCancel || (() => {});
    handleCancel();
  }

  handleSubmit(values, bags) {
    let newData = {};
    const { id, type } = this.props;
    const { item, imagePreviewUrl } = this.state;
    if (type.value !== 'member') {
      newData = {
        id,
        name_o: values.name_o,
        name_s: values.name_s,
        parent_id: (values.parent_id && values.parent_id.id) || item.parent_id,
        register_no: values.register_no,
        logo: imagePreviewUrl || '',
        email: values.email,
        mobile_phone: values.mobile_phone,
        addressline1: values.addressline1,
        addressline2: values.addressline2,
        state: values.state,
        city: values.city,
        zip_code: values.zip_code,
        level: this.getLevel((values.parent_id && values.parent_id.id) || item.parent_id) || item.level,
        is_club: values.is_club ? values.is_club.value : 0
      };
    } else {
      newData = {
        id,
        name: values.name,
        surname: values.surname,
        gender: values.gender.id,
        birthday: moment(values.birthday).format('YYYY-MM-DD'),
        email: values.email,
        weight_id: values.role_id && values.role_id.is_player == 1 ? (values.weight_id && values.weight_id.id) : '',
        dan: values.role_id && values.role_id.is_player == 1 ? (values.dan && values.dan.value) : '',
        identity: values.identity,
        org_id: values.org_id.id,
        club_id: (values.club_id && values.club_id.id) || '',
        role_id: values.role_id.id,
        profile_image: imagePreviewUrl || '',
        position: values.position.value ? values.position.value 
          : values.position.length > 0 && values.position[0].value || values.position,
        active: item.active,
        register_date: values.register_date,
        name_o: values.org_id.name_o,
        level: values.level
      };
    }
    let {
      handleSave
    } = this.props;

    handleSave = handleSave || (() => {});

    if (values.role_id && (values.role_id.id == 2 || values.role_id.id == 4) && values.club_id == '') {
      bags.setStatus({
        color: 'danger',
        children: 'Club is required for this member.'
      });
      bags.setSubmitting(false);
      return;
    }

    handleSave(id, newData);
    bags.setSubmitting(false);
  }

  render() {
    const {
      isOpen, item, org_list, filtered_club
    } = this.state;
    const { imagePreviewUrl } = this.state;

    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }
    const {
      type,
      roles,
      weights
    } = this.props;

    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return (
      <Modal
        isOpen={isOpen}
        toggle={this.handleCancel}
        onClosed={this.handleCancel}
        className="modal-edit-item"
      >
        <ModalHeader toggle={this.handleCancel} style={{ borderBottom: 'none' }} />
        <ModalBody>
          {
            type.value === 'member' && item ? (
              <Formik
                ref={this.formikRef2}
                initialValues={{
                  org_id: null,
                  club_id: null,
                  role_id: null,
                  profile_image: null,
                  register_date: [year, month, day].join('-'),
                  name: '',
                  surname: '',
                  gender: null,
                  birthday: null,
                  email: '',
                  identity: '',
                  weight_id: null,
                  dan: null,
                  position: ''
                }}
                validationSchema={
                  Yup.object().shape({
                    org_id: Yup.mixed().required('This field is required!'),
                    role_id: Yup.mixed().required('This field is required!'),
                    name: Yup.string().required('This field is required!'),
                    surname: Yup.string().required('This field is required!'),
                    gender: Yup.mixed().required('This field is required!'),
                    birthday: Yup.mixed().required('This field is required!'),
                    email: Yup.string().email('Email is not valid!').required('This field is required!'),
                    identity: Yup.string().required('This field is required!')
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
                      <Col sm="4">
                        <FormGroup>
                          <Label for="role_id">Role</Label>
                          <Select
                            name="role_id"
                            classNamePrefix={!!errors.role_id && touched.role_id ? 'invalid react-select-lg' : 'react-select-lg'}
                            indicatorSeparator={null}
                            options={roles}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name}
                            value={values.role_id}
                            onChange={(value) => {
                              setFieldValue('role_id', value);
                            }}
                            onBlur={this.handleBlur}
                          />
                          {!!errors.role_id && touched.role_id && (
                            <FormFeedback className="d-block">{errors.role_id}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="org_id">
                            Organization
                          </Label>
                          <Select
                            name="org_id"
                            classNamePrefix={!!errors.org_id && touched.org_id ? 'invalid react-select-lg' : 'react-select-lg'}
                            indicatorSeparator={null}
                            options={org_list}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name_o}
                            value={values.org_id}
                            onChange={(value) => {
                              setFieldValue('org_id', value);
                              setFieldValue('club_id', '');

                              this.setState({
                                filtered_club: this.state.club_list.filter(club => club.parent_id == value.id)
                              });
                            }}
                            onBlur={this.handleBlur}
                          />
                          {!!errors.org_id && touched.org_id && (
                            <FormFeedback className="d-block">{errors.org_id}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="club_id">
                            Club
                          </Label>
                          <Select
                            name="club_id"
                            classNamePrefix={!!errors.club_id && touched.club_id ? 'invalid react-select-lg' : 'react-select-lg'}
                            indicatorSeparator={null}
                            options={
                              filtered_club.length > 0 
                                ? filtered_club 
                                : values.org_id && this.state.club_list.filter(club => club.parent_id == values.org_id.id)
                            }
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name_o}
                            value={values.club_id}
                            onChange={(value) => {
                              setFieldValue('club_id', value);
                            }}
                            onBlur={this.handleBlur}
                          />
                          {!!errors.club_id && touched.club_id && (
                            <FormFeedback className="d-block">{errors.club_id}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col xs="6">
                        <FormGroup>
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
                          <Input
                            name="level"
                            type="hidden"
                            value={values.level || ''}
                          />
                        </FormGroup>
                      </Col>
                      <Col xs="6">
                        <FormGroup>
                          <Label for="register_date">Register Date</Label>
                          <Input
                            name="register_date"
                            type="date"
                            placeholder="YYYY-MM-DD"
                            value={values.register_date || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.register_date && touched.register_date}
                          />
                          {
                            !!errors.register_date && touched.register_date && 
                              <FormFeedback className="d-block">{errors.register_date}</FormFeedback> 
                          }
                        </FormGroup>
                      </Col>
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
                          <FormFeedback className="d-block">{errors.name}</FormFeedback>
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
                          <FormFeedback className="d-block">{errors.surname}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
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
                            }}
                            onBlur={this.handleBlur}
                          />
                          {!!errors.gender && touched.gender && (
                            <FormFeedback className="d-block">{errors.gender}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="birthday">Birthday</Label>
                          <Input
                            name="birthday"
                            type="date"
                            placeholder="YYYY-MM-DD"
                            value={values.birthday || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.birthday && touched.birthday}
                          />
                          {!!errors.birthday && touched.birthday && <FormFeedback className="d-block">{errors.birthday}</FormFeedback> }
                        </FormGroup>
                      </Col>
                      <Col sm="6">
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
                          {!!errors.email && touched.email && (<FormFeedback className="d-block">{errors.email}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="identity">Member ID</Label>
                          <Input
                            name="identity"
                            type="text"
                            readOnly
                            value={values.identity || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.identity && touched.identity}
                          />
                          <FormFeedback>{errors.identity}</FormFeedback>
                        </FormGroup>
                      </Col>
                      {
                        values.role_id && values.role_id.is_player == 1 && (
                          <Col sm="6">
                            <Label for="weight_id">Weight</Label>
                            <Select
                              name="weight_id"
                              menuPlacement="top"
                              classNamePrefix={
                                values.role_id && values.role_id.is_player == 1 && !values.weight_id && touched.weight_id ? 
                                  'invalid react-select-lg' : 'react-select-lg'
                              }
                              value={values.weight_id}
                              options={weights.filter(weight => weight.id != 0)}
                              getOptionValue={option => option.id}
                              getOptionLabel={option => option.weight + ' Kg'}
                              onChange={(value) => {
                                setFieldValue('weight_id', value);
                              }}
                            />
                            {
                              values.role_id && values.role_id.is_player == 1 && !values.weight_id && touched.weight_id && 
                              <FormFeedback className="d-block">This field is required!</FormFeedback>
                            }
                          </Col>
                        )
                      }
                      {
                        values.role_id && values.role_id.is_player == 1 && (
                          <Col sm="6">
                            <Label for="dan">Dan</Label>
                            <Select
                              name="dan"
                              menuPlacement="top"
                              classNamePrefix={
                                values.role_id && values.role_id.is_player == 1 && !values.dan && touched.dan ?
                                  'invalid react-select-lg' : 'react-select-lg'
                              }
                              value={values.dan}
                              options={Dans.filter(dan => dan.value != 'dan' && dan.value != 'kyu')}
                              getOptionValue={option => option.value}
                              getOptionLabel={option => option.label}
                              onChange={(value) => {
                                setFieldValue('dan', value);
                              }}
                            />
                            {
                              values.role_id && values.role_id.is_player == 1 && !values.dan && touched.dan &&
                              <FormFeedback className="d-block">This field is required!</FormFeedback>
                            }
                          </Col>
                        )
                      }
                      {
                        values.role_id && values.role_id.id == 1 && (
                          <Col xs="6">
                            <FormGroup>
                              <Label for="position">Position</Label>
                              <Input
                                name="position"
                                type="text"
                                value={values.position || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                invalid={values.role_id && values.role_id.is_player != 1 && !values.position && touched.position}
                                />
                              {
                                values.role_id && values.role_id.is_player != 1 && !values.position && touched.position &&
                                <FormFeedback className="d-block">This field is required!</FormFeedback>
                              }
                            </FormGroup>
                          </Col>
                        )
                      }
                      {
                        values.role_id && values.role_id.id == 3 && (
                          <Col xs="6">
                            <FormGroup>
                              <Label for="position">Referee Type</Label>
                              <Select
                                name="position"
                                classNamePrefix="react-select-lg"
                                indicatorSeparator={null}
                                options={referee_type_options.filter(item => item.value !== 'all')}
                                getOptionValue={option => option.value}
                                getOptionLabel={option => option.label}
                                value={values.position}
                                onChange={(value) => {
                                  setFieldValue('position', value);
                                }}
                                onBlur={this.handleBlur}
                              />
                            </FormGroup>
                          </Col>
                        )
                      }
                    </Row>
                    <div className="w-100 d-flex justify-content-end mt-2">
                      <div>
                        <Button
                          disabled={isSubmitting}
                          type="submit"
                          color="primary"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
              />
            ) : (
              <Formik
                ref={this.formikRef1}
                initialValues={{
                  name_o: '',
                  name_s: '',
                  parent_id: '',
                  register_no: '',
                  email: '',
                  logo: null,
                  mobile_phone: '',
                  addressline1: '',
                  addressline2: '',
                  state: '',
                  city: '',
                  zip_code: '',
                  level: '',
                  is_club: false
                }}
                validationSchema={
                  Yup.object().shape({
                    name_o: Yup.string().required('This field is required!'),
                    register_no: Yup.string().required('This field is required!'),
                    email: Yup.string().email('Email is not valid!').required('This field is required!'),
                  })
                }
                onSubmit={this.handleSubmit.bind(this)}
                render={({
                  values,
                  errors,
                  touched,
                  status,
                  setFieldValue,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    {status && <UncontrolledAlert {...status} />}
                    <Row>
                      <Col xs="6">
                        <FormGroup>
                          <Label for="logo">Logo Image</Label>
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
                      <Col></Col>
                    </Row>
                    <Row>
                      <Col xs="6">
                        <FormGroup>
                          <Label for="is_club">Organization Type</Label>
                          <Select
                            name="is_club"
                            classNamePrefix="react-select-lg"
                            indicatorSeparator={null}
                            options={SetSwitch}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            value={values.is_club}
                            onChange={(value) => {
                              setFieldValue('is_club', value);
                            }}
                            onBlur={this.handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        {org_list.length > 0 && values.is_club && values.is_club.value == 1 && (
                          <FormGroup>
                            <Label for="parent_id">
                              Federation
                            </Label>
                            <Select
                              name="parent_id"
                              classNamePrefix={!!errors.parent_id && touched.parent_id ? 'invalid react-select-lg' : 'react-select-lg'}
                              indicatorSeparator={null}
                              options={org_list}
                              getOptionValue={option => option.id}
                              getOptionLabel={option => option.name_o}
                              value={values.parent_id}
                              invalid={!!errors.parent_id && touched.parent_id}
                              onChange={(value) => {
                                setFieldValue('parent_id', value);
                              }}
                              onBlur={this.handleBlur}
                            />
                            {!!errors.parent_id && touched.parent_id && (
                              <FormFeedback className="d-block">{errors.parent_id}</FormFeedback>
                            )}
                          </FormGroup>
                        )}
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="name_o">
                            Organization Name
                          </Label>
                          <Input
                            type="text"
                            name="name_o"
                            value={values.name_o}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.name_o && touched.name_o}
                          />
                          <FormFeedback>{errors.name_o}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="name_s">
                            Simple Name
                          </Label>
                          <Input
                            type="text"
                            name="name_s"
                            value={values.name_s}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.name_s && touched.name_s}
                          />
                          <FormFeedback>{errors.name_s}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="3">
                        <FormGroup>
                          <Label for="register_no">
                            Register Number
                          </Label>
                          <Input
                            type="text"
                            name="register_no"
                            value={values.register_no}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.register_no && touched.register_no}
                          />
                          <FormFeedback>{errors.register_no}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="3">
                        <FormGroup>
                          <Label for="mobile_phone">
                            Mobile Phone
                          </Label>
                          <Input
                            type="phone"
                            name="mobile_phone"
                            value={values.mobile_phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.mobile_phone && touched.mobile_phone}
                          />
                          <FormFeedback>{errors.mobile_phone}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="email">
                            Email
                          </Label>
                          <Input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.email && touched.email}
                          />
                          <FormFeedback>{errors.email}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="addressline1">
                            Address Line1
                          </Label>
                          <Input
                            type="text"
                            name="addressline1"
                            value={values.addressline1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.addressline1 && touched.addressline1}
                          />
                          <FormFeedback>{errors.addressline1}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="addressline2">
                            Address Line2
                          </Label>
                          <Input
                            type="text"
                            name="addressline2"
                            value={values.addressline2}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="state">State</Label>
                          <Input
                            name="state"
                            type="text"
                            value={values.state || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.state && touched.state}
                          />
                          {!!errors.state && touched.state && (<FormFeedback className="d-block">{errors.state}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="city">City</Label>
                          <Input
                            name="city"
                            type="text"
                            value={values.city || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.city && touched.city}
                          />
                          {!!errors.city && touched.city && (<FormFeedback className="d-block">{errors.city}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="zip_code">Zip Code</Label>
                          <Input
                            name="zip_code"
                            type="text"
                            value={values.zip_code || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.zip_code && touched.zip_code}
                          />
                          {!!errors.zip_code && touched.zip_code && (<FormFeedback className="d-block">{errors.zip_code}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                    </Row>

                    <div className="w-100 d-flex justify-content-end mt-2">
                      <div>
                        <Button
                          disabled={isSubmitting}
                          type="submit"
                          color="primary"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
              />
            )
          }
        </ModalBody>
      </Modal>
    );
  }
}

export default EditModal;
