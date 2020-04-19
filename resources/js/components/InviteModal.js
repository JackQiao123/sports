/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import {
  Row, Col,
  Modal, ModalBody, ModalHeader,
	Button
} from 'reactstrap';

class InviteModal extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
					isOpen: true
				}
				
				this.handleCancel = this.handleCancel.bind(this);
    }

		handleCancel() {
			let {
				handleCancel
			} = this.props;
	
			handleCancel = handleCancel || (() => {});
			handleCancel();
		}

		handleSendBtn() {
			let {
        handleSend
      } = this.props;
      
      handleSend = handleSend || (() => {});

      handleSend();
    }

		render() {
			const {
				isOpen
      } = this.state;
      
      const {permission} = this.props;

			return (
				<Modal
					isOpen={isOpen}
					toggle={this.handleCancel}
					onClosed={this.handleCancel}
					className="modal-edit-item"
					centered={true}
				>
					<ModalHeader toggle={this.handleCancel} style={{ borderBottom: 'none' }} />
					<ModalBody>
						<Row>
							<Col sm="12">
								<h5 className="text-center">
									Your invitation will be sent to <span className="text-danger">{this.props.email}</span> now.
								</h5>
							</Col>
							<Col sm="12" className="mt-3">
								<h5 className="text-center">
									Do you want to make this account as "{permission} Manager" permission?
								</h5>
							</Col>
							<Col sm="12"
								className="offset-sm-5 mt-5"
							>
								<Button
                  type="button"
                  color="success"
                  onClick={this.handleSendBtn.bind(this)}
                >
									Send
								</Button>
							</Col>
						</Row>
					</ModalBody>
				</Modal>
			)
		}
}

export default InviteModal;