import * as React from "react"
import {NotificationType} from "../../../types/notification.types"

type Props = {
    closeAction: () => void
    title: string
    type: NotificationType
    children?: React.ReactNode
}

export const TypedNotification = (props: Props) => (
    <div className={`oph-alert oph-alert-${props.type}`}>
        <div className="oph-alert-container">
            <div className="oph-alert-title">{props.title}</div>
            <div className="oph-alert-text">{props.children}</div>
            <button
                className="oph-button oph-button-close"
                type="button"
                title="Close"
                aria-label="Close"
                onClick={props.closeAction}
            >
                <span aria-hidden="true">×</span>
            </button>
        </div>
    </div>
)