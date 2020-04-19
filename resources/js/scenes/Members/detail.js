import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import { Segment, Image } from 'semantic-ui-react';
import Api from '../../apis/app';
import Bitmaps from '../../theme/Bitmaps';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import MainTopBar from '../../components/TopBar/MainTopBar';
import AdminBar from '../../components/AdminBar';
import { referee_type_options } from '../../configs/data';

class MemberDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      member: {},
      is_super: ''
    };
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    this.setState({
      is_super: user.user.is_super
    });

    const mem_id = this.props.location.state;
    const mem_data = await Api.get(`member/${mem_id}`);
    const { response, body } = mem_data;
    switch (response.status) {
      case 200:
        this.setState({
          member: body
        });
        break;
      case 406:
        break;
      default:
        break;
    }
  }

  render() {
    const { member, is_super } = this.state;

    return (
      <Fragment>
        {is_super == 1 ? <AdminTopBar /> : <MainTopBar />}

        <div className={is_super == 1 ? "d-flex" : ""}>
          {is_super == 1 && (
            <AdminBar />
          )}
          <div className={is_super == 1 ? "admin-dashboard pt-5" : "main-content detail"}>
            <Container>
              <Segment>
                <Row>
                  <Col lg="3">
                    <div className="detail-image">
                      <Image
                       className="m-auto" 
                       src={member.profile_image ? "../" + member.profile_image 
                        : (member.gender == 1 ? Bitmaps.maleAvatar : Bitmaps.femaleAvatar)} />
                    </div>
                  </Col>
                  <Col lg="9">
                    {
                      member.is_player == 1 ? (
                        <Fragment>
                          <Row>
                            <Col sm="12">
                              <h5 className="pt-3 py-2">
                                <b>Club Name</b>
                                  :
                                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.club_name}
                                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;( Region:&nbsp;&nbsp;
                                {member.org_name}
                                {' '}
                                )
                              </h5>
                            </Col>
                            <Col md="6" lg="8">
                              <h5 className="py-2">
                                <b>Name</b>
                                :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.name}
                                {' '}
                                {member.patronymic != '-' && member.patronymic}
                                {' '}
                                {member.surname}
                              </h5>
                            </Col>
                            <Col md="6" lg="4">
                              <h5 className="py-2">
                                <b>Gender</b>
                                :
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                { member.gender == 1 ? 'Male' : 'Female' }
                              </h5>
                            </Col>
                          </Row>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <Row>
                            <Col sm="6">
                              <h5 className="pt-3 pb-2">
                                <b>Name</b>
                                :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.name}
                                {' '}
                                {member.patronymic != '-' && member.patronymic}
                                {' '}
                                {member.surname}
                              </h5>
                            </Col>
                            <Col sm="6">
                              <h5 className="py-2">
                                <b>Register Date</b>
                                :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.register_date}
                              </h5>
                            </Col>
                            <Col sm={member.role_id == 1 || member.role_id == 4 ? '6' : '12'}>
                              {member.level == 3 ? (
                                <h5 className="py-2">
                                  <b>Club Name</b>
                                    :
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                  {member.club_name}
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;( Region:&nbsp;&nbsp;
                                  {member.org_name}
                                  {' '}
                                  )
                                </h5>
                              ) : (
                                <h5 className="py-2">
                                  <b>Regional Federation Name</b>
                                  :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                  {member.club_name}
                                </h5>
                              )}
                            </Col>
                            {
                              (member.role_id == 1 || member.role_id == 4) && (
                                <Col sm="6">
                                  <h5 className="py-2">
                                    <b>{member.role_id == 1 ? 'Position' : 'Referee Type'}</b>
                                    :
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    {
                                      member.role_id == 1 ? (member.position == '' ? '---' : member.position)
                                      : referee_type_options.filter(item => item.value == member.position)[0].label
                                    }
                                    {}
                                  </h5>
                                </Col>
                              )
                            }
                            <Col sm="4">
                              <h5 className="py-2">
                                <b>Birthday</b>
                                :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.birthday}
                              </h5>
                            </Col>
                            <Col sm="4">
                              <h5 className="py-2">
                                <b>Gender</b>
                                :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.gender == 1 ? 'Male' : 'Female'}
                              </h5>
                            </Col>
                            <Col sm="4">
                              <h5 className="py-2">
                                <b>Role</b>
                                :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.role_name}
                              </h5>
                            </Col>
                          </Row>
                        </Fragment>
                      )
                    }
                    <Row>
                      <Col sm="12">
                        <h5 className="py-2">
                          <b>Email</b>
                          :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <a href={`mailto:${member.email}`}>{member.email}</a>
                        </h5>
                      </Col>
                    </Row>
                    {member.is_player == 1 ? (
                      <Row>
                        <Col sm="8">
                          <h5 className="py-2">
                            <b>Weight</b>
                            :
                            {' '}
                            {member.weight}
                            {' '}
                            Kg
                          </h5>
                        </Col>
                        <Col sm="4">
                          <h5 className="py-2">
                            <b>Dan</b>
                            :
                            {' '}
                            {member.dan}
                          </h5>
                        </Col>
                      </Row>
                    ) : ''}
                  </Col>
                </Row>
              </Segment>
            </Container>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default MemberDetail;