import { blue, cyan, gray, red, white, yellow } from "@std/fmt/colors"
import { isArray, isPlainObject } from "is-what"
import { maxLength, minLengthOrApplyTrailingPad } from "./utils/string.utils.ts"
import { LogLevel } from "./types/log-level.type.ts"
import { LogLevelOperator } from "./types/log-level-operator.type.ts"
import type { LogMessage } from "./types/log-message.type.ts"
import { type LoggerOptions, LoggerOptionDefaults } from "./types/logger-options.type.ts";
import { DateUtils } from "./utils/date.utils.ts";
import { TimestampFormat } from "./types/timestamp-format.type.ts";

/**
 Class that outputs messages to the console.
 */
export class Logger {

    /**
     The global log level.
     */
    public static level = LogLevel.DEBUG

    /**
     The global log level operator.

     Defaults to `GREATER_OR_EQUAL`.
     */
    public static levelOperator = LogLevelOperator.GREATER_OR_EQUAL

    /**
     Optional set of pre-determined categories to use for message alignment.
     */
    public static alignmentCategories?: string[]

    /**
     Flag indicating if logging is enabled for this logger.
     */
    public isEnabled = true

    /**
     Initializes a logger with an optional category & options.
     @param category - An optional log category.
     @param options - Optional logger configuration options.
     */
    constructor(
        private readonly category?: string,
        private readonly options?: LoggerOptions
    ) {

        this.options = {
            ...LoggerOptionDefaults,
            ...options
        }

    }

    /**
     Flag indicating if Deno environment logging is enabled.
     */
    public static isDenoLoggingEnabled(): boolean {

        if (Deno.env.get("NO_LOG")) {
            return false
        }

        return true

    }

    /**
     Logs a message.
     @param message - The message to log.
     @param throwOnError - Flag indicating if errors should be thrown while logging, default to `false`.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public logMessage(

        message: LogMessage,
        throwOnError: boolean = false

    ): LogMessage | undefined {

        return this._log(
            message,
            throwOnError
        )

    }

    /**
     Logs a message.
     @param message - The message to log.
     @param level - The desired log-level.
     @param throwOnError - Flag indicating if errors should be thrown while logging, defaults to `false`.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public log(

        message: string,
        level: LogLevel,
        throwOnError: boolean = false,
        ctx?: any

    ): LogMessage | undefined {

        return this.logMessage(
            this.message(message, level, ctx),
            throwOnError
        )

    }

    /**
     Logs a debug message.
     @param message - The message to log.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public debug(

        message: string,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.DEBUG,
            false,
            ctx
        )

    }

    /**
     Logs an info message.
     @param message - The message to log.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public info(

        message: string,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.INFO,
            false,
            ctx
        )

    }

    /**
     Logs a warning message.
     @param message - The message to log.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public warn(

        message: string,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.WARN,
            false,
            ctx
        )

    }

    /**
     Logs an error message.
     @param message - The message to log.
     @param throws - Flag indicating if the error should be thrown while logging, defaults to `false`.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public error(

        message: string,
        throws: boolean = false,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.ERROR,
            throws,
            ctx
        )

    }

    /**
     Logs & throws a fatal message.
     @param message - The message to log.
     @param ctx - Optional context data to attach to the message.
     */
    public fatal(

        message: string,
        ctx?: any

    ) {

        this.log(
            message,
            LogLevel.FATAL,
            true,
            ctx
        )

    }

    /**
     Logs a newline to the console.
     */
    public newline() {
        console.log()
    }

    /**
     Creates an unlogged message.
     @param message - The message.
     @param level - The desired log-level.
     @param ctx - Optional context data to attach to the message.
     @returns An unlogged message.
     */
    public message(message: string, level: LogLevel, ctx?: any): LogMessage {

        const date = new Date()

        const formatted = this.formatMessage(
            level,
            message,
            date,
            this.category,
            ctx
        )

        return {
            message,
            formatted,
            level,
            date,
            category: this.category,
            ctx
        }

    }

    // MARK: Private

    private canLog(level: LogLevel): boolean {

        if (!Logger.isDenoLoggingEnabled || !this.isEnabled) {
            return false
        }

        switch (Logger.levelOperator) {
        case LogLevelOperator.EQUAL: return level == Logger.level
        case LogLevelOperator.GREATER_OR_EQUAL: return level >= Logger.level
        case LogLevelOperator.LESS_OR_EQUAL: return level <= Logger.level
        }

    }

    private _log(

        message: LogMessage,
        throwOnError: boolean

    ): LogMessage | undefined {

        if (!this.canLog(message.level)) {
            return
        }

        switch (message.level) {
        case LogLevel.DEBUG: console.debug(message.formatted); break
        case LogLevel.INFO:  console.info(message.formatted); break
        case LogLevel.WARN:  console.warn(message.formatted); break
        case LogLevel.ERROR:

            console.error(message.formatted)

            if (throwOnError) {
                throw new Error(message.message)
            }

            break

        case LogLevel.FATAL:

            console.error(message.formatted)
            throw new Error(message.message)

        }

        return message

    }

    // private _log(

    //     message: string,
    //     level: LogLevel,
    //     throwOnError: boolean = false,
    //     ctx?: any

    // ): LogMessage | undefined {

    //     if (!this.canLog(level)) {
    //         return
    //     }

    //     const logMessage = this.message(
    //         message,
    //         level,
    //         ctx
    //     )

    //     switch (level) {
    //     case LogLevel.DEBUG: console.debug(logMessage.formatted); break
    //     case LogLevel.INFO:  console.info(logMessage.formatted); break
    //     case LogLevel.WARN:  console.warn(logMessage.formatted); break
    //     case LogLevel.ERROR:

    //         console.error(logMessage.formatted)

    //         if (throwOnError) {
    //             throw new Error(logMessage.message)
    //         }

    //         break

    //     case LogLevel.FATAL:

    //         console.error(logMessage.formatted)
    //         throw new Error(logMessage.message)

    //     }

    //     return logMessage

    // }

    private symbol(level: LogLevel): string {

        const colorizer = this.colorizer(level)

        const symbols = [
            "[DEBUG]",
            "[INFO]",
            "[WARN]",
            "[ERROR]",
            "[FATAL]"
        ]

        const length = maxLength(symbols)

        return colorizer(minLengthOrApplyTrailingPad(
            symbols[level],
            length
        ))

    }

    private colorizer(level: LogLevel): (text: string) => string {

        switch (level) {
        case LogLevel.DEBUG: return cyan
        case LogLevel.INFO:  return blue
        case LogLevel.WARN:  return yellow
        case LogLevel.ERROR: return red
        case LogLevel.FATAL: return red
        }

    }

    private formatMessage(

        level: LogLevel,
        message: string,
        date: Date,
        category?: string,
        ctx?: any

    ): string {

        let result = ""

        if (this.options!.timestampFormat != TimestampFormat.NONE) {

            const timestamp = DateUtils.format(
                date,
                this.options!.timestampFormat!
            )

            result = `${this.symbol(level)} ${white(timestamp)}`

        }
        else {
            result = this.symbol(level)
        }

        if (category) {
            result += ` ${yellow(`[${category}]`)}`
        }

        const colorizer = this.colorizer(level)

        // Message

        if ((Logger.alignmentCategories?.length ?? 0) > 0) {

            const categoryLength = category?.length ?? 0
            const maxCategoryLength = maxLength(Logger.alignmentCategories!)

            const count = category ?
                (maxCategoryLength - categoryLength) :
                (maxCategoryLength - categoryLength) + 3

            result += " ".repeat(count)

        }

        if (this.options!.messageDelimiter) {
            result += ` ${this.options!.messageDelimiter} ${colorizer(message)}`
        }
        else {
            result += ` ${colorizer(message)}`
        }

        // Context

        if (ctx) {

            const formattedCtx = this.formatValue(
                ctx,
                this.options!.compactContext ?? LoggerOptionDefaults.compactContext
            )

            if (this.options!.messageDelimiter) {
                result += ` ${this.options!.messageDelimiter} ${gray(formattedCtx)}`
            }
            else {
                result += ` ${gray(formattedCtx)}`
            }

        }

        return result

    }

    private formatValue(

        value: any,
        compact: boolean,
        depth: number = 1

    ): string {

        if (isPlainObject(value)) {
            return this.formatObjectValue(value, compact, depth)
        }
        else if (isArray(value)) {
            return this.formatArrayValue(value, compact, depth)
        }

        return String(value)

    }

    private formatObjectValue(

        obj: any,
        compact: boolean,
        depth: number = 1

    ): string {

        const pairs = Object
            .entries(obj)

        let result = ""

        if (compact) {

            result = "{"

            for (let i = 0; i < pairs.length; i++) {

                const pair = pairs[i]
                const key = pair[0]
                const value = this.formatValue(pair[1], compact, depth + 1)
                const isLast = (i == pairs.length - 1)
                result += ` ${key}: ${value}${isLast ? "" : ","}`

            }

            result += " }"

        }
        else {

            const indent = 2
            const propertyIndent = " ".repeat(indent * depth)
            const bracketIndent  = propertyIndent.substring(0, propertyIndent.length - indent)

            result = "{\n"

            for (let i = 0; i < pairs.length; i++) {

                const pair = pairs[i]
                const key = pair[0]
                const value = this.formatValue(pair[1], compact, depth + 1)
                const isLast = (i == pairs.length - 1)
                result += `${propertyIndent}${key}: ${value}${isLast ? "" : ","}\n`

            }

            result += `${bracketIndent}}`

        }

        return result

    }

    private formatArrayValue(

        arr: any[],
        compact: boolean,
        depth: number = 1

    ): string {

        let result = ""

        if (compact) {

            result = "["

            for (let i = 0; i < arr.length; i++) {

                const isLast = (i == arr.length - 1)
                const value = this.formatValue(arr[i], compact, depth + 1)
                result += `${value}${isLast ? "" : ", "}`

            }

            result += "]"

        }
        else {

            const indent = 2
            const propertyIndent = " ".repeat(indent * depth)
            const bracketIndent  = propertyIndent.substring(0, propertyIndent.length - indent)

            result = "[\n"

            for (let i = 0; i < arr.length; i++) {

                const isLast = (i == arr.length - 1)
                const value = this.formatValue(arr[i], compact, depth + 1)
                result += `${propertyIndent}${value}${isLast ? "" : ","}\n`

            }

            result += `${bracketIndent}]`

        }

        return result

    }

}
