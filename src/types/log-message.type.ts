import type { LogLevel } from "./log-level.type.ts"

/**
 Type representing a logged message.
 */
export type LogMessage = {

    /** The raw message */
    message: string

    /** The formatted message */
    formattedMessage: string

    /** The message's level */
    level: LogLevel

    /** The message's date */
    date: Date

    /** The message's category */
    category?: string

    /** The message's context data */
    ctx?: any

}
