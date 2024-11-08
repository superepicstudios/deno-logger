import { Logger } from "../src/logger.ts";

const logger = new Logger("Demo")
logger.debug("Hello, debug!")
logger.info("Hello, info!")
logger.warn("Hello, warning!")
logger.error("Hello, error!")

try {
    logger.fatal("Hello, fatal!")
}
catch (error) {
    console.log(`>> Caught fatal - ${error}`)
}
