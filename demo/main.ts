import { Logger } from "../src/logger.ts";

const logger = new Logger("Demo")
logger.debug("Hello, debug!")
logger.info("Hello, info!")
logger.warn("Hello, warning!")
logger.error("Hello, error!")

logger.info("Message with context", {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    message: "Suh Dude"
})

try {
    logger.fatal("Hello, fatal!")
}
catch (error) {
    console.log(`>> Caught fatal - ${error}`)
}
