import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Toast, ToastBody, ToastHeader,
  Row, Col, Input, Button,
  Form, FormGroup, FormFeedback
} from 'reactstrap';
import {
  withRouter
} from 'react-router-dom';

import Api from '../../apis/app';

class InviteAccept extends Component {
  constructor(props) {
    super(props);
    this.state = {
      member: [],
      status: true,
      msg: ''
    };

    this.formikRef = React.createRef();
  }

  async componentDidMount() {
    localStorage.clear('token');

    await this.handleResend();
  }

  async handleResend() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const data = await Api.get('invite-accept', { token });
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          member: body.member
        });
        break;
      case 406:
        if (body.message === 'Empty token.') {
          this.props.history.push('/');
        } else {
          this.setState({
            status: false,
            msg: body.message
          });
        }
        break;
      default:
        break;
    }
  }

  async handleSubmit(values, bags) {
    let newData = {};

    newData = {
      email: this.state.member.email,
      code: values.code,
      pass: values.pass
    };

    const data = await Api.post('reg-user', newData);

    const { response, body } = data;

    switch (response.status) {
      case 200:
        this.setState({
          status: false,
          msg: 'Congratulations!'
        });
        break;
      case 422:
        if (body.message) {
          bags.setStatus({
            color: 'danger',
            children: body.message
          });
        }
        bags.setErrors(body.data);
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  handleLogin() {
    this.props.history.push('/login');
  }

  render() {
    const {
      member
    } = this.state;
    return (
      <Fragment>
        <div className="main-content">
          <Container>
            <div className="p-5 rounded">
              <Toast>
                <ToastHeader>
                  {!this.state.status && (
                    <h1 className="text-danger text-center mb-5 font-weight-bold">{this.state.msg}</h1>
                  )}
                </ToastHeader>
                {this.state.status ? (
                  <ToastBody>
                    <h2 className="text-center mb-4">Welcome to our LiveMedia.</h2>
                    <h5 className="text-center">
                        Please confirm the verification code from email and generate your own password.
                    </h5>

                    <Formik
                      ref={this.formikRef}
                      initialValues={{
                        code: '',
                        pass: ''
                      }}
                      validationSchema={
                          Yup.object().shape({
                            code: Yup.string().required('Verification Code is required.'),
                            pass: Yup.string().min(6, 'Password must be 6 characters at least.').required('Password is required.')
                          })
                        }
                      onSubmit={this.handleSubmit.bind(this)}
                      render={({
                        values,
                        errors,
                        touched,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        isSubmitting
                      }) => (
                        <Form onSubmit={handleSubmit}>
                          <Row>
                            <Col className="offset-sm-2 mt-5" sm="3">
                              <h5 className="text-right">Your Email Address : </h5>
                            </Col>
                            <Col className="mt-5" sm="2">
                              <h5>{member.email}</h5>
                            </Col>
                          </Row>
                          <Row>
                            <Col className="offset-sm-3 mt-5" sm="3">
                              <h5 className="text-right mt-2">Verification Code : </h5>
                            </Col>
                            <Col className="mt-5" sm="2">
                              <FormGroup>
                                <Input
                                  type="text"
                                  name="code"
                                  values={values.code}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={!!errors.code && touched.code}
                                />
                                <FormFeedback>{errors.code}</FormFeedback>
                              </FormGroup>
                            </Col>
                            <Col className="mt-5" sm="2">
                              <FormGroup>
                                <Button
                                  className="mt-1"
                                  type="button"
                                  onClick={this.handleResend.bind(this)}
                                >
                                  <i className="fa fa-lg fa-sync" />
                                  &nbsp;&nbsp;&nbsp;Resend
                                </Button>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col className="offset-sm-3 mt-5" sm="3">
                              <h5 className="text-right mt-2">Password : </h5>
                            </Col>
                            <Col className="mt-5" sm="4">
                              <FormGroup>
                                <Input
                                  type="password"
                                  name="pass"
                                  values={values.pass}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  invalid={!!errors.pass && touched.pass}
                                />
                                <FormFeedback>{errors.pass}</FormFeedback>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col className="mt-5 text-center" sm="12">
                              <FormGroup>
                                <Button
                                  color="success"
                                  type="submit"
                                  disabled={isSubmitting}
                                >
                                    Accept
                                </Button>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Form>
                      )}
                       />


                  </ToastBody>
                ) : (
                  <ToastBody className="text-center">
                    <Button
                      className="mt-5"
                      type="button"
                      onClick={this.handleLogin.bind(this)}
                      >
                        Login
                    </Button>
                  </ToastBody>
                )}
              </Toast>
            </div>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(InviteAccept);