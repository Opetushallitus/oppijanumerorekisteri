import React from 'react'
import Select2 from '../common/select/Select2';
import R from 'ramda'
import $ from 'jquery'

export default class OrgSelect2 extends React.Component {

    render() {
        const MIN_SEARCH_CHARS = 2;
        const SHOW_ALL_IF_LESS_RESULTS_THAN = 100;
        const LEVEL_PADDING = 10; //px

        const {data, ...props} = this.props;
        const opts = (props.options || (props.options = {}));
        opts.templateResult  = result => $(`<span style="padding-left:${LEVEL_PADDING*(result.level-1)}px"></span>`).text(result.text);
        const filterData = term => org => org.id === this.props.value || (term && org.searchText && org.searchText.indexOf(term) >= 0);
        props.passData = true;
        if (data.length < SHOW_ALL_IF_LESS_RESULTS_THAN) {
            props.data = data;
        } else {
            opts.minimumInputLength = MIN_SEARCH_CHARS;
            opts.ajax = {
                data: function(params) {
                    return params.term;
                },
                processResults: function(result) {
                    return {results:result};
                },
                transport: function(params, success, failure) {
                    if (props.value || (params.data && params.data.length >= MIN_SEARCH_CHARS)
                        || data.length < SHOW_ALL_IF_LESS_RESULTS_THAN) {
                        setTimeout(() => success(R.filter(filterData(params.data ? params.data.toLowerCase() : null), data)), 0);
                    } else {
                        setTimeout(() => failure(), 0);
                    }
                    return {status:'0'};
                }
            };
            props.data = R.filter(filterData(null), data);
        }
        return (<Select2 {...props}/>)
    }

}
