import { Logger } from "../src/logger.ts";
import { LogLevel } from "../src/types/log-level.type.ts";

const logger = new Logger("Demo")

const deferredMessage = logger.message(
    "Hello, deferred message!",
    LogLevel.DEBUG
)

logger.debug("Hello, debug!")
logger.info("Hello, info!")
logger.warn("Hello, warning!")
logger.error("Hello, error!")

logger.info("Hello, message with context!", {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    message: "Suh Dude"
})

logger.logMessage(deferredMessage)

try {
    logger.fatal("Hello, fatal!")
}
catch (error) {

    logger.newline()
    console.log(`>> Caught fatal - ${error}`)

}
