import { blue, cyan, red, white, yellow } from "@std/fmt/colors"
import { maxLength, minLengthOrApplyTrailingPad } from "./utils/string.utils.ts"
import { LogLevel } from "./types/log-level.type.ts"
import { LogLevelOperator } from "./types/log-level-operator.type.ts"
import type { LogMessage } from "./types/log-message.type.ts"
import type { LoggerOptions } from "./types/logger-options.type.ts";

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
     @param options - Logger options.
     */
    constructor(
        private readonly category?: string,
        private readonly options: LoggerOptions = { messageDelimiter: "::" }
    ) {}

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
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public log(message: string, level: LogLevel): LogMessage | undefined {
        return this._log(message, level)
    }

    /**
     Logs a debug message.
     @param message - The message to log.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public debug(message: string): LogMessage | undefined {
        return this._log(message, LogLevel.DEBUG)
    }

    /**
     Logs an info message.
     @param message - The message to log.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public info(message: string): LogMessage | undefined {
        return this._log(message, LogLevel.INFO)
    }

    /**
     Logs a warning message.
     @param message - The message to log.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public warn(message: string): LogMessage | undefined {
        return this._log(message, LogLevel.WARN)
    }

    /**
     Logs an error message.
     @param message - The message to log.
     @param throws - Flag indicating if the error should be thrown.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public error(message: string, throws: boolean = false): LogMessage | undefined {
        return this._log(message, LogLevel.ERROR, throws)
    }

    /**
     Logs & throws a fatal message.
     @param message - The message to log.
     @returns The logged message, or `undefined` if nothing was logged.
     */
    public fatal(message: string) {
        this._log(message, LogLevel.FATAL, true)
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

    private _log(message: string, level: LogLevel, throwOnError: boolean = false): LogMessage | undefined {

        if (!this.canLog(level)) {
            return
        }

        const now = new Date()

        const formattedMessage = this.format(
            level,
            message,
            now,
            this.category
        )

        const logMessage: LogMessage = {
            level: level,
            category: this.category,
            message: message,
            formattedMessage: formattedMessage,
            date: new Date()
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

    private format(level: LogLevel, message: string, date: Date, category?: string): string {

        const timestamp = date
            .toUTCString()
            .replaceAll("GMT", "UTC")

        let result = `${this.symbol(level)} ${white(timestamp)}`

        if (category) {
            result += ` ${yellow(`[${category}]`)}`
        }

        const colorizer = this.colorizer(level)

        if (this.options.messageDelimiter) {
            result += ` ${this.options.messageDelimiter} ${colorizer(message)}`
        }
        else {
            result += ` ${colorizer(message)}`
        }

        return result

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

}
