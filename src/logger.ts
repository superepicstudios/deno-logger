import { blue, cyan, gray, red, white, yellow } from "@std/fmt/colors"
import { isArray, isPlainObject } from "is-what"
import { maxLength, minLengthOrApplyTrailingPad } from "./utils/string.utils.ts"
import { LogLevel } from "./types/log-level.type.ts"
import { LogLevelOperator } from "./types/log-level-operator.type.ts"
import type { LogMessage } from "./types/log-message.type.ts"
import { type LoggerOptions, LoggerOptionDefaults } from "./types/logger-options.type.ts";

/**
 Class that outputs messages to the console.
 */
export class Logger {

    /**
     The global logger's level.
     */
    public static level = LogLevel.DEBUG

    /**
     The global logger's level operator.

     Defaults to `GREATER_OR_EQUAL`.
     */
    public static levelOperator = LogLevelOperator.GREATER_OR_EQUAL

    /**
     Flag indicating if logging is ensbled for this logger.
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
     @param level - The desired log level.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public log(message: string, level: LogLevel, ctx?: any): LogMessage | undefined {
        return this._log(message, level, false, ctx)
    }

    /**
     Logs a debug message.
     @param message - The message to log.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public debug(message: string, ctx?: any): LogMessage | undefined {
        return this._log(message, LogLevel.DEBUG, false, ctx)
    }

    /**
     Logs an info message.
     @param message - The message to log.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public info(message: string, ctx?: any): LogMessage | undefined {
        return this._log(message, LogLevel.INFO, false, ctx)
    }

    /**
     Logs a warning message.
     @param message - The message to log.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public warn(message: string, ctx?: any): LogMessage | undefined {
        return this._log(message, LogLevel.WARN, false, ctx)
    }

    /**
     Logs an error message.
     @param message - The message to log.
     @param throws - Flag indicating if the error should be thrown, defaults to `false`.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public error(message: string, throws: boolean = false, ctx?: any): LogMessage | undefined {
        return this._log(message, LogLevel.ERROR, throws, ctx)
    }

    /**
     Logs & throws a fatal message.
     @param message - The message to log.
     @param ctx - Optional context data to attach to the message.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public fatal(message: string, ctx?: any) {
        this._log(message, LogLevel.FATAL, true, ctx)
    }

    /**
     Logs a newline to the console.
     */
    public newline() {
        console.log()
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

        message: string,
        level: LogLevel,
        throwOnError: boolean = false,
        ctx?: any

    ): LogMessage | undefined {

        if (!this.canLog(level)) {
            return
        }

        const now = new Date()

        const formattedMessage = this.formatMessage(
            level,
            message,
            now,
            this.category,
            ctx
        )

        const logMessage: LogMessage = {
            message,
            formattedMessage,
            level,
            date: new Date(),
            category: this.category,
            ctx
        }

        switch (level) {
        case LogLevel.DEBUG: console.debug(formattedMessage); break
        case LogLevel.INFO:  console.info(formattedMessage); break
        case LogLevel.WARN:  console.warn(formattedMessage); break
        case LogLevel.ERROR:

            console.error(formattedMessage)

            if (throwOnError) {
                throw new Error(message)
            }

            break

        case LogLevel.FATAL:

            console.error(formattedMessage)
            throw new Error(message)

        }

        return logMessage

    }

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

        const timestamp = date
            .toUTCString()
            .replaceAll("GMT", "UTC")

        let result = `${this.symbol(level)} ${white(timestamp)}`

        if (category) {
            result += ` ${yellow(`[${category}]`)}`
        }

        const colorizer = this.colorizer(level)

        // Message

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
