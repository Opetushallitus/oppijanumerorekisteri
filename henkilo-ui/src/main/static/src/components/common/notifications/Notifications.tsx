import React from "react"
import WideGreenNotification from "./WideGreenNotification"
import WideRedNotification from "./WideRedNotification"
import WideBlueNotification from "./WideBlueNotification"
import {Localisations} from "../../../types/localisation.type"

export type NotificationType = "ok" | "error"

export type Notification = {
    id?: string
    type: NotificationType
    notL10nMessage: string
    organisaatioOid?: string
    ryhmaIdList?: Array<string>
}

type Props = {
    notifications: Array<Notification>
    L: Localisations
    closeAction: (type: NotificationType, id: string | null | undefined) => void
    styles?: any
}

const Notifications = ({notifications, L, closeAction, styles}: Props) => (
    <div style={styles}>
        {notifications
            .filter(notification => notification.type === "ok")
            .map((notification, idx) => (
                <WideGreenNotification
                    key={idx}
                    message={L[notification.notL10nMessage]}
                    closeAction={() =>
                        closeAction(
                            notification.type,
                            notification.organisaatioOid &&
                                notification.ryhmaIdList
                                ? notification.organisaatioOid +
                                      notification.ryhmaIdList.join("")
                                : notification.id,
                        )
                    }
                />
            ))}
        {notifications
            .filter(notification => notification.type === "error")
            .map((notification, idx) => (
                <WideRedNotification
                    key={idx}
                    message={L[notification.notL10nMessage]}
                    closeAction={() =>
                        closeAction(
                            notification.type,
                            notification.organisaatioOid &&
                                notification.ryhmaIdList
                                ? notification.organisaatioOid +
                                      notification.ryhmaIdList.join("")
                                : notification.id,
                        )
                    }
                />
            ))}
        {notifications
            .filter(notification => notification.type === "info")
            .map((notification, idx) => (
                <WideBlueNotification
                    key={idx}
                    message={L[notification.notL10nMessage]}
                    closeAction={() =>
                        closeAction(
                            notification.type,
                            notification.organisaatioOid &&
                                notification.ryhmaIdList
                                ? notification.organisaatioOid +
                                      notification.ryhmaIdList.join("")
                                : notification.id,
                        )
                    }
                />
            ))}
    </div>
)

export default Notifications