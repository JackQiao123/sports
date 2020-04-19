/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Row, Col,
  Form, FormGroup, FormFeedback,
  Button, Input, Label,
  UncontrolledAlert,
  InputGroup, InputGroupAddon,
  Alert
} from 'reactstrap';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

class Setting extends Component {
  constructor(props) {
    super(props);

    const user = JSON.parse(localStorage.getItem('auth'));
    const organization_id = user.user.member_info.organization_id;

    this.state = {
      user_info: user.user.member_info,
      item: [],
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
      org_id: organization_id
    };
    this.formikRef = React.createRef();
  }

  async componentDidMount() {
    const data = await Api.get('setting');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        if (!body.price) {
          body.organization_id = this.state.org_id;
          body.price = 0;
        }

        this.setState({
          item: body
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
      id: values.organization_id,
      price: values.price
    });
  }

  async handleSubmit(values, bags) {
    let newData = {};

    newData = {
      price: values.price
    };

    const data = await Api.put(`setting/${values.id}`, newData);
    const { response } = data;
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
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  render() {
    const {
      user_info
    } = this.state;
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
              <h3 className="text-center text-primary">The membership price is setted in here.</h3>
            </div>
            <Formik
              ref={this.formikRef}
              initialValues={{
                organization_id: null,
                price: 1
              }}

              validationSchema={
                Yup.object().shape({
                  price: Yup.string().matches(/^[+-]?([0-9]*[.])?[0-9]+$/, 'price is only number.')
                    .required('This field is required.')
                })
              }

              onSubmit={this.handleSubmit.bind(this)}

              render={({
                values,
                errors,
                status,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                isSubmitting
              }) => (
                <Form onSubmit={handleSubmit}>
                  {status && <UncontrolledAlert {...status} />}
                  <Row>
                    <Col sm="12">
                      <FormGroup className="d-flex justify-content-center align-items-center">
                        <Label for="price">Membership Price per Judoka</Label>
                        <InputGroup className="price-box">
                          <InputGroupAddon addonType="prepend">{user_info.country === 'uz' ? 'UZS' : 'KZT'}</InputGroupAddon>
                          <Input
                            name="price"
                            type="text"
                            placeholder="price" 
                            value={values.price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.price && touched.price}
                          />
                          <FormFeedback>{errors.price}</FormFeedback>
                        </InputGroup>
                        <Button
                          disabled={isSubmitting}
                          type="submit"
                          color="primary"
                        >
                          Update Membership
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              )}
            />
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default Setting;