import React, { Children } from 'react';
import { createFilter, MenuListProps } from 'react-select';
import { FixedSizeList } from 'react-window';

export type SelectOption = {
    label: string;
    value: string;
};

export type NamedSelectOption = SelectOption & {
    optionsName: string;
};

export type MultiSelectOption = {
    value: unknown[];
};

export type NamedMultiSelectOption = MultiSelectOption & {
    optionsName: string;
};

export const FastMenuList = (props: MenuListProps<SelectOption, false>) => {
    const { children, maxHeight } = props;
    const childrenOptions = Children.toArray(children);
    return (
        <FixedSizeList itemSize={40} height={maxHeight} width="100%" itemCount={childrenOptions.length}>
            {({ index, style }) => (
                <div style={style} key={index} className="oph-ds-select-menu-item">
                    {childrenOptions[index]}
                </div>
            )}
        </FixedSizeList>
    );
};

type SelectState = { isFocused: boolean; isDisabled: boolean };

export const selectStyles = {
    unstyled: true,
    classNames: {
        container: (state: SelectState) =>
            state.isFocused ? 'oph-ds-select-container-focused' : 'oph-ds-select-container',
        indicatorSeparator: () => 'oph-ds-select-indicatorSeparator',
        clearIndicator: () => 'oph-ds-select-clearIndicator',
        control: (state: SelectState) =>
            state.isFocused
                ? 'oph-ds-select-control-focused'
                : state.isDisabled
                  ? 'oph-ds-select-control-disabled'
                  : 'oph-ds-select-control',
        placeholder: (state: SelectState) =>
            state.isDisabled ? 'oph-ds-select-placeholder-disabled' : 'oph-ds-select-placeholder',
        dropdownIndicator: (state: SelectState) =>
            state.isFocused ? 'oph-ds-select-dropdownIndicator-focused' : 'oph-ds-select-dropdownIndicator',
        menu: () => 'oph-ds-select-menu',
        multiValue: () => 'oph-ds-multivalue-label',
        option: () => 'oph-ds-select-option',
    },
};

export const selectProps = {
    components: { MenuList: FastMenuList },
    filterOption: createFilter({ ignoreAccents: false }),
    ...selectStyles,
};
