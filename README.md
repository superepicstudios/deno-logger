# 🪵 Logger

Tiny (but effective) logging library for Deno 🪵🦕

## Installation

```sh
$ deno add jsr:@superepic/logger
```

## Usage

```ts
import { Logger } from "@superepic/logger"

const logger = new Logger()

logger.debug("Hello, debug!")  // => [DEBUG] Fri, 08 Nov 2024 00:04:30 UTC :: Hello, debug!
logger.info("Hello, info!")    // => [INFO]  Fri, 08 Nov 2024 00:04:30 UTC :: Hello, info!
logger.warn("Hello, warning!") // => [WARN]  Fri, 08 Nov 2024 00:04:30 UTC :: Hello, warning!
logger.error("Hello, error!")  // => [ERROR] Fri, 08 Nov 2024 00:04:30 UTC :: Hello, error!
logger.fatal("Hello, fatal!")  // => [FATAL] Fri, 08 Nov 2024 00:04:30 UTC :: Hello, fatal!
```

### Categories

Loggers can be created with a `category` to help organize your console output:

```ts
import { Logger } from "@superepic/logger"

const logger = new Logger("Example")

logger.debug("Hello, world!") // => [DEBUG] Fri, 08 Nov 2024 00:04:30 UTC [Example] :: Hello, debug!
```

### Levels & Operators

By default, loggers are created with a `DEBUG` level & the `GREATER_OR_EQUAL` operator.
This means that _any_ message logged with a level >= `DEBUG` (all messages) will be output to the console.
You can configure this behavior via the static `level` & `levelOperator` properties:

```ts
import { Logger, LogLevel, LogLevelOperator } from "@superepic/logger"

const logger = new Logger("Example")

Logger.level = LogLevel.WARN
Logger.levelOperator = LogLevelOperator.GREATER_OR_EQUAL

logger.debug(...) // => Not Logged
logger.info(...)  // => Not logged
logger.warn(...)  // => Logged
logger.error(...) // => Logged

Logger.level = LogLevel.ERROR
Logger.levelOperator = LogLevelOperator.EQUAL

logger.info(...)  // => Not logged
logger.warn(...)  // => Not logged
logger.error(...) // => Logged

Logger.level = LogLevel.INFO
Logger.levelOperator = LogLevelOperator.LESS_OR_EQUAL

logger.debug(...) // => Logged
logger.info(...)  // => Logged
logger.warn(...)  // => Not logged
```

It's a common practice to output everything when in a developing, but only warnings & errors in production:

```ts
import { Logger, LogLevel } from "@superepic/logger"

const isProduction = (Deno.env.get("env") == "production")

Logger.level = isProduction ? LogLevel.WARN : LogLevel.DEBUG

...
```

### Context Data

```ts
import { Logger } from "@superepic/logger"

const logger = new Logger()

logger.info("Hello, world!", {

    id: crypto.randomUUID(),
    timestamp: new Date()

})

// [DEBUG] Fri, 08 Nov 2024 00:04:30 UTC :: Hello, world! :: {
//   id: 4f8ff698-2799-4283-b010-2367cae0439c,
//   timestamp: Fri Nov 08 2024 23:54:18 GMT-0800 (Pacific Standard Time)
// }
```
