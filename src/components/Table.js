import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';

import TableCell from './TableCell';

class Table extends React.Component {
  render() {
    const {
      items,
      type,
      selectItem,
    } = this.props;
    if (items.length === 0) {
      return (
        <div id="events-list">
          <p className="no-results">Looks like there are no events near you right now.
          </p>
        </div>
      );
    }

    return (
      <List
        id={`${type}-list`}
        itemLayout="vertical"
        dataSource={items}
        renderItem={item =>
          (
            <List.Item key={item.id}>
              <TableCell
                key={`${item.id}-cell`}
                item={item}
                type={type}
                iconName="town-hall"
                selectItem={selectItem}
              />
            </List.Item>
          )}
      />
    );
  }
}

Table.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectItem: PropTypes.func,
  type: PropTypes.string.isRequired,
};

Table.defaultProps = {
  selectItem: () => {},
};

export default Table;
