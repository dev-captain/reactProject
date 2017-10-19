import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import shouldUpdate from 'recompose/shouldUpdate';
import compose from 'recompose/compose';
import Button from 'material-ui/Button';
import ImageEye from 'material-ui-icons/RemoveRedEye';
import linkToRecord from '../../util/linkToRecord';
import translate from '../../i18n/translate';

const ShowButton = ({
    basePath = '',
    label = 'ra.action.show',
    record = {},
    translate,
}) => (
    <Button color="primary" style={{ overflow: 'inherit' }}>
        <Link to={`${linkToRecord(basePath, record.id)}/show`}>
            <ImageEye />
            {label && translate(label)}
        </Link>
    </Button>
);

ShowButton.propTypes = {
    basePath: PropTypes.string,
    label: PropTypes.string,
    record: PropTypes.object,
    translate: PropTypes.func.isRequired,
};

const enhance = compose(
    shouldUpdate(
        (props, nextProps) =>
            (props.record && props.record.id !== nextProps.record.id) ||
            props.basePath !== nextProps.basePath ||
            (props.record == null && nextProps.record != null)
    ),
    translate
);

export default enhance(ShowButton);
