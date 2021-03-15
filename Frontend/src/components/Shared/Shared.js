import { Col, Container, Image, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getDefaultGroupImage, getDefaultUserImage } from '../../_constants/avatar';
import { convertAmount, formatMoney } from '../../_helper/money';

const Avatar = (props) => (
  <>
    <Image
      style={{ width: '27px', height: '27px', borderRadius: '14px' }}
      src={props.avatar || props.defaultAvatar}
      roundedCircle
    />{' '}
    <b>{props.label}</b>
  </>
);

export const UserAvatar = (props) => <Avatar avatar={props.user.avatar} defaultAvatar={getDefaultUserImage()} label={props.user.first_name} />;
export const UserBalanceAvatar = (props) => <Avatar avatar={props.user.avatar} defaultAvatar={getDefaultUserImage()} />;
export const GroupAvatar = (props) => <Avatar avatar={props.group.avatar} defaultAvatar={getDefaultGroupImage()} />;

const LocalizedAmount = (props) => {
  const destinationCurrencyCode = props.user.default_currency;
  const convertedAmount = convertAmount(props.amount, props.currency || 'USD', destinationCurrencyCode);
  const formattedAmount = formatMoney(convertedAmount, destinationCurrencyCode);
  return <b>{formattedAmount}</b>;
}

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const connectedLocalizedAmount = connect(mapState, {})(LocalizedAmount);
export { connectedLocalizedAmount as LocalizedAmount };

