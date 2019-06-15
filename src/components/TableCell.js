import React from 'react';
import PropTypes from 'prop-types';
import superagent from 'superagent';
import moment from 'moment';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import faFacebookSquare from '@fortawesome/fontawesome-free-brands/faFacebookSquare';
import faTwitterSquare from '@fortawesome/fontawesome-free-brands/faTwitterSquare';
import faEnvelope from '@fortawesome/fontawesome-free-solid/faEnvelope';
import faExternalLinkSquareAlt from '@fortawesome/fontawesome-free-solid/faExternalLinkSquareAlt';
import { Card } from 'antd';
import { indivisibleUrl } from '../state/constants';

/* eslint-disable */
require('style-loader!css-loader!antd/es/card/style/index.css');
require('style-loader!css-loader!antd/es/button/style/index.css');
/* eslint-enable */

class TableCell extends React.Component {

  static handlePanelOpen(e) {
    const ele = document.getElementById(e.target.id);
    if (ele.classList.contains('open')) {
      ele.classList.remove('open');
      ele.classList.add('closed');
    } else {
      ele.classList.remove('closed');
      ele.classList.add('open');
    }
  }

  constructor(props) {
    super(props);
    this.renderEvents = this.renderEvents.bind(this);
  }

  renderEvents() {
    const {
      item,
      iconName,
    } = this.props;
    return (
      <Card
        className={`event-cell ${iconName}`}
        key={`${item.id}`}
        title={item.displayName}
      >
        <ul>
          {item.eventName}
        </ul>
        <ul>
          <li className="semi-bold">{item.date}</li>
          <li className="semi-bold">{item.time}</li>
          <li>{item.address}</li>
          <li className="read-more closed" onClick={TableCell.handlePanelOpen} id={item.id}>
            {item.public_description}
          </li>
        </ul>
      </Card>);
  }

  render() {
    return (
      <React.Fragment>
        {this.renderEvents()}
      </React.Fragment>
    );
  }
}

TableCell.propTypes = {
  color: PropTypes.string,
  iconName: PropTypes.string,
  item: PropTypes.shape({}).isRequired,
  refcode: PropTypes.string,
  selectItem: PropTypes.func,
};

TableCell.defaultProps = {
  color: '',
  iconName: '',
  refcode: '',
  selectItem: () => {},
};

export default TableCell;
