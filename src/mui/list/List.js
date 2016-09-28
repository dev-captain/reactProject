import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push as pushAction } from 'react-router-redux';
import { Card, CardTitle, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import inflection from 'inflection';
import { getFormValues } from 'redux-form';
import debounce from 'lodash.debounce';
import queryReducer, { SET_SORT, SET_PAGE, SET_FILTER } from '../../reducer/resource/list/queryReducer';
import Title from '../layout/Title';
import Pagination from './Pagination';
import CreateButton from '../button/CreateButton';
import { crudGetList as crudGetListAction } from '../../actions/dataActions';
import { changeListParams as changeListParamsAction } from '../../actions/listActions';

class List extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.updateSort = this.updateSort.bind(this);
        this.setPage = this.setPage.bind(this);
        this.showFilter = this.showFilter.bind(this);
        this.hideFilter = this.hideFilter.bind(this);
    }

    componentDidMount() {
        this.updateData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.resource !== this.props.resource
         || nextProps.query.sort !== this.props.query.sort
         || nextProps.query.order !== this.props.query.order
         || nextProps.query.page !== this.props.query.page
         || nextProps.query.filter !== this.props.query.filter) {
            this.updateData(Object.keys(nextProps.query).length > 0 ? nextProps.query : nextProps.params);
        }
    }

    componentWillUpdate(nextProps) {
        if (nextProps.filters !== this.props.filters) {
            this.debouncedUpdateFilter(nextProps.filters);
        }
    }

    getBasePath() {
        return this.props.location.pathname;
    }

    refresh(event) {
        event.stopPropagation();
        this.updateData();
    }

    getQuery() {
        return (Object.keys(this.props.query).length > 0) ? this.props.query : { ...this.props.params };
    }

    updateData(query) {
        const { sort, order, page, perPage, filter } = query || this.getQuery();
        this.props.crudGetList(this.props.resource, { page, perPage }, { field: sort, order }, filter);
    }

    updateSort(event) {
        event.stopPropagation();
        this.changeParams({ type: SET_SORT, payload: event.currentTarget.dataset.sort });
    }

    /**
     * check which props has changed, and return an object whose keys is
     * changed prop name and value is the new prop value.
     */
    getChangedProps = ({ filters }) => Object.keys(filters)
        .reduce((changedProps, filterName) => {
            const updatedProps = { ...changedProps };
            if (filters[filterName] !== this.props.filters[filterName]) {
                updatedProps[filterName] = filters[filterName];
            }

            return updatedProps;
        }, {});

    setPage(page) {
        this.changeParams({ type: SET_PAGE, payload: page });
    }

    setFilter = (field, value) => {
        this.changeParams({ type: SET_FILTER, payload: { field, value } });
    }

    debouncedUpdateFilter = debounce((nextFilters) => {
        Object.keys(nextFilters).forEach(filter => {
            this.setFilter(filter, nextFilters[filter]);
        });
    }, 500);

    showFilter(filterName) {
        this.setState({ [filterName]: true });
    }

    hideFilter(filterName) {
        this.setState({ [filterName]: false });
        this.setFilter(filterName);
    }

    changeParams(action) {
        const newParams = queryReducer(this.getQuery(), action);
        this.props.push({ ...this.props.location, query: { ...newParams, filter: JSON.stringify(newParams.filter) } });
        this.props.changeListParams(this.props.resource, newParams);
    }

    render() {
        const { filter, resource, hasCreate, title, data, ids, total, children, isLoading } = this.props;
        const query = this.getQuery();
        const filterValues = query.filter;
        const basePath = this.getBasePath();
        return (
            <Card style={{ margin: '2em', opacity: isLoading ? 0.8 : 1 }}>
                <CardActions style={{ zIndex: 2, display: 'inline-block', float: 'right' }}>
                    {filter && React.createElement(filter, {
                        resource,
                        showFilter: this.showFilter,
                        displayedFilters: this.state,
                        filterValues,
                        context: 'button',
                    })}
                    {hasCreate && <CreateButton basePath={basePath} />}
                    <FlatButton primary label="Refresh" onClick={::this.refresh} icon={<NavigationRefresh />} />
                </CardActions>
                <CardTitle title={<Title title={title} defaultTitle={`${inflection.humanize(inflection.pluralize(resource))} List`} />} />
                {filter && React.createElement(filter, {
                    resource,
                    hideFilter: this.hideFilter,
                    filterValues,
                    displayedFilters: this.state,
                    context: 'form',
                })}
                {React.cloneElement(children, {
                    resource,
                    ids,
                    data,
                    currentSort: query,
                    basePath,
                    updateSort: this.updateSort,
                })}
                <Pagination resource={resource} page={parseInt(query.page, 10)} perPage={parseInt(query.perPage, 10)} total={total} setPage={this.setPage} />
            </Card>
        );
    }
}

List.propTypes = {
    title: PropTypes.any,
    filter: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
    ]),
    filters: PropTypes.object,
    resource: PropTypes.string.isRequired,
    hasCreate: PropTypes.bool.isRequired,
    hasEdit: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    path: PropTypes.string,
    params: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    ids: PropTypes.array,
    total: PropTypes.number.isRequired,
    data: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    crudGetList: PropTypes.func.isRequired,
    changeListParams: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired,
    push: PropTypes.func.isRequired,
};

List.defaultProps = {
    filters: {},
};

function mapStateToProps(state, props) {
    const resourceState = state.admin[props.resource];
    const query = props.location.query;
    if (query.filter && typeof query.filter === 'string') {
        query.filter = JSON.parse(query.filter);
    }

    return {
        query,
        params: resourceState.list.params,
        ids: resourceState.list.ids,
        total: resourceState.list.total,
        data: resourceState.data,
        isLoading: state.admin.loading > 0,
        filters: getFormValues('filterForm')(state),
    };
}

export default connect(
    mapStateToProps,
    {
        crudGetList: crudGetListAction,
        changeListParams: changeListParamsAction,
        push: pushAction,
    },
)(List);
