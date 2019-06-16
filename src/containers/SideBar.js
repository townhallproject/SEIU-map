import React from 'react';
import PropTypes from 'prop-types';

import Table from '../components/Table';

class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.renderTotal = this.renderTotal.bind(this);
  }

  renderTotal() {
    const { items } = this.props;
    return (<p className="event-count">Viewing {items.length} events</p>);
  }

  render() {
    const {
      items,
      selectItem,
      type,
    } = this.props;
    return (
      <div className="side-bar-container">
        {this.renderTotal()}
        <Table
          items={items}
          shouldRender={true}
          type={type}
          selectItem={selectItem}
        />
      </div>
    );
  }
}

SideBar.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectItem: PropTypes.func,
  type: PropTypes.string.isRequired,
};

SideBar.defaultProps = {
  selectItem: () => {},
};
export default SideBar;
