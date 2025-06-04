import React, { Children } from 'react';
import { MenuListProps } from 'react-select';
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
        <FixedSizeList itemSize={36} height={maxHeight} width="100%" itemCount={childrenOptions.length}>
            {({ index, style }) => (
                <div
                    style={{ ...style, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                    key={index}
                >
                    {childrenOptions[index]}
                </div>
            )}
        </FixedSizeList>
    );
};
