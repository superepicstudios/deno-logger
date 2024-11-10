import { TimestampFormat } from "./timestamp-format.type.ts";

/**
 Type representing logger options.
 */
export type LoggerOptions = {

    /**
     * The logger's timestamp format.
     *
     * Defaults to `TimestampFormat.CONDENSED_12` ("dd/MM/yyyy @ hh:mm:ss aa zzzz").
     * @see https://date-fns.org/docs/format
     */
    timestampFormat?: TimestampFormat | string,

    /**
     * The logger's message delimiter.
     *
     * Defaults to "::".
     */
    messageDelimiter?: string,

    /**
     * Flag indicating if context data should be output in a compact-style.
     *
     * Defaults to `false`.
     */
    compactContext?: boolean

}

export const LoggerOptionDefaults = {

    timestampFormat: TimestampFormat.CONDENSED_12,
    messageDelimiter: "::",
    compactContext: false

}
