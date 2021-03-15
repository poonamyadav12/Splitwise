import axios from 'axios';
import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import '../../App.css';
import { getDefaultGroupImage } from '../../_constants/avatar';
import { AlertMessages } from '../Alert/Alert';
import { UploadImage } from '../Image/UploadImage';
import { alertActions } from '../../_actions';
import { GroupMemberList } from './GroupMemberList';

function GroupCreateOrUpdateModal(props) {
  const [name, setName] = useState(props?.group?.name || "");

  const [errorMsg, setErrorMsg] = useState([]);

  const [members, setMembers] = useState(props?.group?.members || []);

  const [imageUrl, setImageUrl] = useState(props?.group?.avatar || getDefaultGroupImage());

  function handleGroupNameChange(e) {
    e.preventDefault();
    setName(e.target.value);
  }

  function handleGroupMemberChange(members) {
    setMembers(members);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = {
      group: {
        id: props?.group?.id,
        creator: props.user.email,
        name,
        members: members.map((m) => ({ first_name: m.first_name, last_name: m.last_name, email: m.email })),
        avatar: imageUrl,
      }
    };

    console.log("group request " + JSON.stringify(data));
    try {
      const response = await axios.post('http://localhost:3001/group/createOrUpdate', data);
      console.log("group create response " + JSON.stringify(response));
      props.reloadHomeView();
      props.closeModal();

    } catch (error) {
      console.log("Error " + JSON.stringify(error));
      const data = error.response.data;
      const msg = Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
      setErrorMsg(msg);
    }
  }

  return (
    <>
      <Modal
        show={props.isOpen}
        onHide={props.closeModal}
        keyboard={false}
        backdrop="static"
        className="group-create-modal"
        animation={false}
        style={{ width: "100vw" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{props.group ? 'UPDATE THE GROUP' : 'START A NEW GROUP'}</Modal.Title>
          <AlertMessages messages={errorMsg} />
        </Modal.Header>
        <Modal.Body style={{ width: "60vw" }} >
          <Container fluid={true}>
            <Row>
              <Col lg={3}>
                <UploadImage defaultImage={props?.group?.avatar || getDefaultGroupImage()} label={'Group avatar'} onChange={setImageUrl}></UploadImage>
              </Col>
              <Col lg={4}><Form.Group controlId="formGroupName">
                <Form.Label>My group shall be called...</Form.Label>
                <Form.Control type="text" style={{ 'font-size': '24px', width: '40rem' }} defaultValue={props?.group?.name} placeholder="1600 Pennsylvania Ave" onChange={handleGroupNameChange} />
              </Form.Group>
                <Card.Title>GROUP MEMBERS</Card.Title>
                <GroupMemberList initialMembers={props?.group?.members || [{
                  first_name: props.user.first_name,
                  email: props.user.email,
                  last_name: props.user.last_name,
                },]} onChange={(members) => handleGroupMemberChange(members)} />
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.closeModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const actionCreators = {
  errorAlert: alertActions.error,
  clearAlert: alertActions.clear,
};

const connectedGroupCreateOrUpdateModal = connect(mapState, actionCreators)(GroupCreateOrUpdateModal);
export { connectedGroupCreateOrUpdateModal as GroupCreateOrUpdateModal };