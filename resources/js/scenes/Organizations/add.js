/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Row, Col,
  Button,
  Form, FormGroup, FormFeedback,
  Input, Label,
  UncontrolledAlert, Alert
} from 'reactstrap';
import Select from 'react-select';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import { SetSwitch } from '../../configs/data';

class OrganizationAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parent_id: '',
      country: '',
      level: '',
      org_list: [],
      imagePreviewUrl: '',
      fileKey: 1,
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: ''
    };
    this.fileRef = React.createRef();
    this.formikRef = React.createRef();
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const parent_id = user.user.member_info.organization_id;
    const country = user.user.country;
    const level = user.user.level == 1 && true;

    this.setState({
      parent_id,
      country,
      level
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
    if (this.state.level == 1 && !values.is_club) {
      bags.setSubmitting(false);
      return;
    }

    if (this.state.level == 1 && values.is_club.value == 1 && values.parent_id == '') {
      bags.setSubmitting(false);
      return;
    }

    let newData = {};
    const { imagePreviewUrl } = this.state;

    newData = {
      parent_id: values.is_club && values.is_club.value == 1 ? values.parent_id.id : this.state.parent_id,
      name_o: values.name_o,
      name_s: values.name_s,
      register_no: values.register_no,
      logo: imagePreviewUrl || '',
      email: values.email,
      mobile_phone: values.mobile_phone,
      addressline1: values.addressline1,
      addressline2: values.addressline2,
      country: this.state.country,
      state: values.state,
      city: values.city,
      zip_code: values.zip_code,
      level: values.is_club === null || (values.is_club && values.is_club.value) == 1 ? 3 : 2,
      is_club: values.is_club === null || (values.is_club && values.is_club.value) == 1 ? 1 : 0
    };

    const data = await Api.post('reg-organization', newData);
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
              ${body.data.register_no !== undefined ? body.data.register_no : ''}`)
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
      imagePreviewUrl,
      org_list
    } = this.state;

    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }
    
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
                parent_id: '',
                name_o: '',
                name_s: '',
                register_no: '',
                email: '',
                logo: null,
                mobile_phone: '',
                addressline1: '',
                addressline2: '',
                state: '',
                city: '',
                zip_code: '',
                is_club: null
              }}
              validationSchema={
                Yup.object().shape({
                  name_o: Yup.string().required('This field is required!'),
                  name_s: Yup.string().required('This field is required!'),
                  register_no: Yup.string().required('This field is required!'),
                  email: Yup.string().email('Email is not valid!').required('This field is required!'),
                  mobile_phone: Yup.string().matches(/^\+?[0-9]\s?[-]\s|[0-9]$/, 'Mobile phone is incorrect!')
                    .required('This field is required!'),
                  addressline1: Yup.string().required('This field is required!'),
                  city: Yup.string().required('This field is required!'),
                  state: Yup.string().required('This field is required!'),
                  zip_code: Yup.string().required('This field is required!')
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
                    <Col xs="6"></Col>
                    {
                      level == 1 && (
                        <Col xs="6">
                          <FormGroup>
                            <Label for="is_club">Organization Type</Label>
                            <Select
                              name="is_club"
                              classNamePrefix={
                                !values.is_club && touched.is_club ? 'invalid react-select-lg' : 'react-select-lg'
                              }
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
                            {!values.is_club && touched.is_club && (
                              <FormFeedback className="d-block">This field is required!</FormFeedback>
                            )}
                          </FormGroup>
                        </Col>
                      )
                    }
                    {
                      level == 1 && (
                        <Col sm="6">
                          {
                            values.is_club && values.is_club.value == 1 && (
                            <FormGroup>
                              <Label for="parent_id">
                                Regional Federation
                              </Label>
                              <Select
                                name="parent_id"
                                classNamePrefix={
                                  values.parent_id == '' && touched.parent_id ? 'invalid react-select-lg' : 'react-select-lg'
                                }
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
                              {values.parent_id == '' && touched.parent_id && (
                                <FormFeedback className="d-block">This field is required!</FormFeedback>
                              )}
                            </FormGroup>
                            )
                          }
                        </Col>
                      )
                    }
                    <Col sm="6">
                      <FormGroup>
                        <Label for="name_o">
                          {level == 1 ? "Organization Name" : "Club Name"}
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
                        {
                          !!errors.zip_code && touched.zip_code &&  (
                            <FormFeedback className="d-block">{errors.zip_code}</FormFeedback>
                          )
                        }
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
    );
  }
}

export default withRouter(OrganizationAdd);