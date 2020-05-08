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
                    <Row>
                      <Col sm="12">
                        {
                          member.is_player == 1 ? (
                            <h5 className="pt-3 py-2">
                              <b className="mr-2">Club Name :</b>
                              {member.club_name} ( Region: {member.org_name} )
                            </h5>
                          ) : (
                            member.level == 3 ? (
                              <h5 className="py-2">
                                <b className="mr-2">Club Name :</b>
                                <span className="mr-2">{member.club_name}</span>
                                <span>( Region: {member.org_name} )</span>
                              </h5>
                            ) : (
                              <h5 className="py-2">
                                <b className="mr-2">Regional Federation Name :</b>
                                <span>{member.club_name}</span>
                              </h5>
                            )
                          )
                        }
                      </Col>
                    </Row>
                    <Row>
                      <Col sm="6">
                        <h5 className="py-2">
                          <b className="mr-2">Name :</b>
                          <span>{member.name}  {member.surname}</span>
                        </h5>
                      </Col>
                      <Col sm="6">
                        <h5 className="py-2">
                          <b className="mr-2">Gender :</b>
                          <span>{ member.gender == 1 ? 'Male' : 'Female' }</span>
                        </h5>
                      </Col>
                      <Col sm="6">
                        <h5 className="py-2">
                          <b className="mr-2">Birthday :</b>
                          <span>{member.birthday}</span>
                        </h5>
                      </Col>
                      <Col sm="6"></Col>
                    </Row>
                    {member.is_player == 1 ? (
                      <Row>
                        <Col sm="6">
                          <h5 className="py-2">
                            <b className="mr-2">Weight :</b>
                            <span>{member.weight + ' Kg'}</span>
                          </h5>
                        </Col>
                        <Col sm="6">
                          <h5 className="py-2">
                            <b className="mr-2">Dan :</b>
                            <span>{member.dan}</span>
                          </h5>
                        </Col>
                      </Row>
                    ) : (
                      <Row>
                        <Col sm="6">
                          <h5 className="py-2">
                            <b className="mr-2">Register Date :</b>
                            <span>{member.register_date}</span>
                          </h5>
                        </Col>
                        <Col sm="6">
                          <h5 className="py-2">
                            <b className="mr-2">Role :</b>
                            <span>{member.role_name}</span>
                          </h5>
                        </Col>
                        {
                          (member.role_id == 1 || member.role_id == 3) && (
                            <Col sm="6">
                              <h5 className="py-2">
                                <b className="mr-2">{member.role_id == 1 ? 'Position :' : 'Referee Type :'} :</b>
                                <span>
                                {
                                  member.role_id == 1 ? (member.position == '' ? '---' : member.position)
                                  : referee_type_options.filter(item => item.value == member.position)[0].label
                                }
                                </span>
                              </h5>
                            </Col>
                          )
                        }
                      </Row>
                    )}
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