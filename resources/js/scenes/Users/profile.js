/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import moment from 'moment';
import * as Yup from 'yup';
import {
  Container, Row, Col,
  Form, FormGroup, FormFeedback,
  Button, Input, Label,
  UncontrolledAlert,
  Alert
} from 'reactstrap';
import Select from 'react-select';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

import { Genders } from '../../configs/data';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      imagePreviewUrl: '',
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: ''
    };
    this.formikRef = React.createRef();
  }

  async componentDidMount() {
    const data = await Api.get('profile');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          item: body,
          imagePreviewUrl: body.profile_image
        });
        break;
      case 406:
        break;
      default:
        break;
    }
    this.settingValues();
  }

  settingValues() {
    const {
      item
    } = this.state;
    const {
      formikRef
    } = this;
    const values = item;

    formikRef.current.setValues({
      id: values.id,
      role_id: values.role_id,
      organization_id: values.organization_id,
      name: values.name,
      surname: values.surname,
      gender: values.gender == 1 ? Genders[0] : Genders[1],
      profile_image: values.profile_image,
      register_date: values.register_date,
      birthday: values.birthday,
      parent_id: values.parent_id
    });
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
    let newData = {};
    const { imagePreviewUrl } = this.state;
    newData = {
      id: values.id,
      org_id: values.organization_id,
      role_id: values.role_id,
      name: values.name,
      surname: values.surname,
      gender: values.gender.id,
      profile_image: imagePreviewUrl || '',
      birthday: moment(values.birthday).format('YYYY-MM-DD'),
      register_date: values.register_date
    };

    const data = await Api.put(`member/${values.id}`, newData);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          successMessage: 'Updated Successfully!'
        });

        setTimeout(() => {
          this.setState({ alertVisible: false });
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
        this.setState({
          alertVisible: true,
          messageStatus: false,
          failMessage: body.data
        });
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
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

  render() {
    const {
      imagePreviewUrl
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
                organization_id: null,
                register_date: '',
                profile_image: null,
                name: '',
                surname: '',
                gender: null,
                birthday: null
              }}

              validationSchema={
                Yup.object().shape({
                  name: Yup.string().required('This field is required!'),
                  surname: Yup.string().required('This field is required!'),
                  gender: Yup.mixed().required('This field is required!'),
                  birthday: Yup.mixed().required('This field is required!')
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
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label>Register Date</Label>
                        <Input
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={values.register_date}
                          readOnly
                        />
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
                      <FormGroup className={!!errors.birthday && touched.birthday ? 'invalid calendar' : 'calendar'}>
                        <Label for="birthday">Birthday</Label>
                        <SemanticDatepicker
                          name="birthday"
                          placeholder="YYYY-MM-DD"
                          value={values.birthday ? new Date(values.birthday) : ''}
                          onChange={(event, data) => {
                            if (data.value) {
                              let birthday = this.convertDate(data.value);
                        
                              values.birthday = birthday;
                            } else {
                              values.birthday = '';
                            }
                          }}
                        />
                        {!!errors.birthday && touched.birthday && (
                          <FormFeedback className="d-block">{errors.birthday}</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  <hr/>              
                  <div className="w-100 d-flex justify-content-end">
                    <div>
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        color="primary"
                      >
                        Update Profile
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

export default Profile;