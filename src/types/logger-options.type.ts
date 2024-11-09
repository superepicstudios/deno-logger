/**
 Type representing logger options.
 */
export type LoggerOptions = {

    /**
     * The logger's message delimiter.
     *
     * Defaults to "::".
     */
    messageDelimiter?: string

    /**
     * Flag indicating if context data should be output in a compact-style.
     *
     * Defaults to `false`.
     */
    compactContext?: boolean

}

export const LoggerOptionDefaults = {

    messageDelimiter: "::",
    compactContext: false

}
