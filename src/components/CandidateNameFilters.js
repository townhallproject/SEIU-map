import React from 'react';
import { Tag } from 'antd';
import PropTypes from 'prop-types';

const { CheckableTag } = Tag;

/* eslint-disable */
require('style-loader!css-loader!antd/es/tag/style/index.css');
/* eslint-enable */


class CandidateNameFilters extends React.Component {
  constructor(props) {
    super(props);
    const { selectedNames } = this.props;
    this.state = {
      selectedNames,
    };
  }

  componentDidMount() {
    const { onFilterChanged } = this.props;
    onFilterChanged(this.state.selectedNames);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      selectedNames: newProps.selectedNames,
    });
  }

  handleChange(tag, checked) {
    const { onFilterChanged } = this.props;
    const { selectedNames } = this.state;
    const nextSelectedTags = checked ?
      [...selectedNames, tag] :
      selectedNames.filter(t => t !== tag);
    this.setState(
      { selectedNames: nextSelectedTags },
      () => onFilterChanged(nextSelectedTags),
    );
  }

  render() {
    const { selectedNames } = this.state;
    const {
      names,
    } = this.props;

    return (
      <div>
        <h6 style={{ display: 'inline', marginRight: 8 }}>Filter by candidate:</h6>
        {names.map(tag => (
          <CheckableTag
            key={tag}
            checked={selectedNames.indexOf(tag) > -1}
            onChange={checked => this.handleChange(tag, checked)}
            className="town-hall-icon"
          >
            {tag}
          </CheckableTag>
        ))}

      </div>
    );
  }
}

CandidateNameFilters.propTypes = {
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  selectedNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CandidateNameFilters;
