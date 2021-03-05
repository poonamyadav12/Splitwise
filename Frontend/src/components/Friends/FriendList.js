import React, { Component } from 'react';
import '../../App.css';
import axios from 'axios';
import { FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ListGroup, Card } from 'react-bootstrap';

export class FriendList extends Component {

    constructor(props) {
        super(props);
        this.state = { friends: [] };
    }

    componentDidMount() {
        // axios.get('http://localhost:3001/user/groups/' + this.props.userId)
        //     .then((response) => {
        //         //update the state with the response data
        //         this.setState({
        //             groups: response.data
        //         });
        //     });
    }

    render() {
        return <Card style={{ width: '15rem' }}>
            <ListGroup variant="flush">
                <ListGroup.Item><FriendName friendName="First Friend" friendId="123" /></ListGroup.Item>
                <ListGroup.Item><FriendName friendName="Second Friend" friendId="123" /></ListGroup.Item>
                <ListGroup.Item><FriendName friendName="Third Friend" friendId="123" /></ListGroup.Item>
                <ListGroup.Item><FriendName friendName="Fourth Friend" friendId="123" /></ListGroup.Item>
            </ListGroup>
        </Card>;
    }
}

const FriendName = (props) => <div><FaTag />&nbsp;<Link to={"/friendPreview" + props.friendId}>{props.friendName}</Link></div>