import { Alert } from "react-bootstrap";

export const AlertMessages = (props) => (
    props.messages.length ? (<Alert color='primary' variant="danger" style={{ opacity: "unset" }}>
        <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
        {props.messages.map(message => <p key="{message}">
            {message}
        </p>)}
    </Alert>) : null);