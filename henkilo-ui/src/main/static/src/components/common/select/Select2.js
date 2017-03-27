import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import shallowEqualFuzzy from 'shallow-equal-fuzzy';
import $ from 'jquery';
import 'select2';
import 'select2/dist/css/select2.min.css'
import './oph-select2-style.css'

const namespace = 'react-select2-wrapper';

function swapNodesIfInGivenOrder(a, b) {
  if (a.nextSibling === b) {
    let aparent = a.parentNode;
    b.parentNode.insertBefore(a, b);
    aparent.insertBefore(b, a);
  }
}

const Select2 = React.createClass({
  propTypes: {
    defaultValue: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.array,
      PropTypes.string
    ]),
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.array,
      PropTypes.string
    ]),
    data: PropTypes.array,
    events: PropTypes.array,
    options: PropTypes.object,
    multiple: PropTypes.bool,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onSelect: PropTypes.func,
    onChange: PropTypes.func,
    onUnselect: PropTypes.func,
    passData: PropTypes.bool,
    l10n: PropTypes.object
  },

  el: null,
  forceUpdateValue: false,

  componentDidMount: function() {
    this.initSelect2(this.props);
    this.updateValue();
  },

  componentWillReceiveProps: function(nextProps) {
    this.updSelect2(nextProps);
  },

  componentDidUpdate: function() {
    this.updateValue();
  },

  componentWillUnmount: function() {
    this.destroySelect2();
  },

  initSelect2: function(props, updateValue = false) {
    const { options } = props;

    this.el = $(ReactDOM.findDOMNode(this));
    // fix for updating selected value when data is changing
    if (updateValue) {
      this.forceUpdateValue = true;
      this.el.off(`change.${namespace}`).val(null).trigger('change');
    }
    this.el.select2(this.prepareOptions(options));
    this.attachEventHandlers(props);
  },

  updSelect2: function(props) {
    const prevProps = this.props;

    if (!shallowEqualFuzzy(prevProps.data, props.data)) {
      this.destroySelect2(false);
      this.initSelect2(props, true);
    } else {
      const { options } = props;
      if (!shallowEqualFuzzy(prevProps.options, options)) {
        this.el.select2(this.prepareOptions(options));
      }
    }

    const handlerChanged = e => prevProps[e[1]] !== props[e[1]];
    if (props.events.some(handlerChanged)) {
      this.detachEventHandlers(props);
      this.attachEventHandlers(props);
    }
  },

  updateValue: function() {
    const { value, defaultValue, multiple } = this.props;
    const newValue = this.prepareValue(value, defaultValue);
    const currentValue = multiple ? this.el.val() || [] : this.el.val();

    if (!shallowEqualFuzzy(currentValue, newValue) || this.forceUpdateValue) {
      this.el.val(newValue).trigger('change');
      this.forceUpdateValue = false;
    }
  },

  destroySelect2: function(withCallbacks = true) {
    if (withCallbacks) {
      this.detachEventHandlers(this.props);
    }

    this.el.select2('destroy');
    this.el = null;
  },

  attachEventHandlers: function(props) {
    props.events.forEach(event => {
      if (typeof props[event[1]] !== 'undefined') {
        this.el.on(event[0], props[event[1]]);
      }
    });
    // Hacking select2 to seem like having no additional search field:
    if (!props.multiple) {
      // Multiple-selection does not add a separate search field but single selects do. However, these dropdown
      // menus are identical in terms of css classes so we need to apply a more specific class through an event:
      this.el.on(`select2:open.${namespace}`, function() {
        const $above = $(".select2-dropdown.select2-dropdown--above");
        if ($above.length) {
          // If the single select dropdown is above, we first need to switch the order of elements
          // within the dropdown to get the search field over the selection placeholder (but only do it once per dropdown)
          const $search = $above.find('.select2-search--dropdown'),
              $results = $above.find('.select2-results');
          // remove+append will not work (causes bound events to fail) so we need to switch them in place:
          swapNodesIfInGivenOrder($search[0], $results[0]); // does not do this if already swapped (select2 reuses the same dropdown)
          // Add the position fixing css class after the switch (so that mouse key release won't happen over
          // an option (which would cause the dropdown to close instantly):
          $(".select2-container--open").addClass('single-selector');
        } else {
          // Just do the position fix for below dropdown for single selection:
          $(".select2-container--open").addClass('single-selector');
        }
      });
    }
  },

  detachEventHandlers: function(props) {
    props.events.forEach(event => {
      if (typeof props[event[1]] !== 'undefined') {
        this.el.off(event[0]);
      }
    });
  },

  prepareValue: function(value, defaultValue) {
    const issetValue = typeof value !== 'undefined' && value !== null;
    const issetDefaultValue = typeof defaultValue !== 'undefined';

    if (!issetValue && issetDefaultValue) {
      return defaultValue;
    }
    return value;
  },

  prepareOptions: function(options) {
    const opt = options;
    if (typeof opt.dropdownParent === 'string') {
      opt.dropdownParent = $(opt.dropdownParent);
    }
    if (this.props.passData) {
      opt.data = this.props.data;
    }
    
    if (this.props.l10n) {
      const l10n = this.props.l10n;
      opt.language = {
        errorLoading: function () {
          return l10n['VIRHE_LADATTAESSA_VASTAUKSIA'];
        },
        inputTooLong: function (args) {
          const overChars = args.input.length - args.maximum;
          return l10n.msg('POISTA_MERKKIA', overChars);
        },
        inputTooShort: function (args) {
          return l10n.msg('SYOTA_VAHINTAAN_MERKKIA', args.minimum);
        },
        loadingMore: function () {
          return l10n['LADATAAN'];
        },
        noResults: function () {
          return l10n['EI_TULOKSIA'];
        },
        maximumSelected: function (args) {
          return l10n.msg('VOIT_VALITA_VAIN', args.maximum);
        },
        searching: function () {
          return l10n['ETSITAAN'];
        }
      };
    }
    return opt;
  },

  isObject: function(value) {
    const type = typeof value;
    return type === 'function' || (value && type === 'object') || false;
  },

  makeOption: function(item) {
    if (this.isObject(item)) {
      const itemParams = $.extend({}, item),
          id = item.id,
          text = item.text;
      delete itemParams.id;
      delete itemParams.text;
      return (<option key={`option-${id}`} value={id} {...itemParams}>{text}</option>);
    }
    return (<option key={`option-${item}`} value={item}>{item}</option>);
  },

  render: function() {
    const props = $.extend({}, this.props),
        data = this.props.data,
        // value = this.props.value,
        passData = this.props.passData;
    delete props.data;
    delete props.value;
    delete props.passData;
    delete props.options;
    delete props.events;
    delete props.onOpen;
    delete props.onClose;
    delete props.onSelect;
    delete props.onChange;
    delete props.onUnselect;
    delete props.l10n;

    return (
      <select {...props}>
        {!passData && data.map((item, k) => {
          if (this.isObject(item) && this.isObject(item.children)) {
            const itemParams = $.extend({}, item),
                children = item.children,
                text = item.text;
            delete itemParams.children;
            delete itemParams.text;
            return (
              <optgroup key={`optgroup-${k}`} label={text} {...itemParams}>
                {children.map((child) => this.makeOption(child))}
              </optgroup>
            );
          }
          return this.makeOption(item);
        })}
      </select>
    );
  }
});

Select2.defaultProps= {
  data: [],
  events: [
    [`change.${namespace}`, 'onChange'],
    [`select2:open.${namespace}`, 'onOpen'],
    [`select2:close.${namespace}`, 'onClose'],
    [`select2:select.${namespace}`, 'onSelect'],
    [`select2:unselect.${namespace}`, 'onUnselect']
  ],
  options: {},
  multiple: false
};

export default Select2
