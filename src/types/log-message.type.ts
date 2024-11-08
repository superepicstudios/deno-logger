import type { LogLevel } from "./log-level.type.ts"

/**
 Type representing a logged message.
 */
export type LogMessage = {

    /** The message's level */
    level: LogLevel

    /** The messages category */
    category?: string

    /** The raw message */
    message: string

    /** The formatted message */
    formattedMessage: string

    /** The message's date */
    date: Date

}
