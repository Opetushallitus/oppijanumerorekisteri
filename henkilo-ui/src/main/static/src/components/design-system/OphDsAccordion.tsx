import React, { ReactNode, useEffect } from 'react';

type AccordionItem = {
    header: string;
    children: (show: boolean) => ReactNode;
};

type PageProps = {
    items: AccordionItem[];
};

export const OphDsAccordion = ({ items }: PageProps) => {
    const [showItems, setShowItems] = React.useState<number[]>([]);

    useEffect(() => {
        setShowItems([]);
    }, [items]);

    const onToggle = (index: number) => {
        if (showItems.includes(index)) {
            setShowItems(showItems.filter((i) => i !== index));
        } else {
            setShowItems([...showItems, index]);
        }
    };

    return (
        <div className="oph-ds-accordion">
            {items.map((item, index) => {
                const show = showItems.includes(index);
                return (
                    <React.Fragment key={`accordion-header-${index}`}>
                        <div className="oph-ds-accordion-header">
                            <button
                                id={`header-${index}`}
                                onClick={() => onToggle(index)}
                                aria-expanded={show}
                                aria-controls={`section-${index}`}
                                className="oph-ds-button-transparent oph-ds-accordion-header-button"
                            >
                                <span className="oph-ds-accordion-header-text">{item.header}</span>
                                <span className="oph-ds-accordion-icon"></span>
                            </button>
                        </div>
                        <div id={`section-${index}`} role="region" aria-labelledby={`header-${index}`} hidden={!show}>
                            {item.children(show)}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
