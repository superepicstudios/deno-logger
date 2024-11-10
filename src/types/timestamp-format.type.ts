/**
 * Representation of the various preset timestamp formats.
 */
export enum TimestampFormat {

    NONE = "_none",
    FULL_24 = "EEE, dd LLL yyyy @ HH:mm:ss zzzz",
    FULL_12 = "EEE, dd LLL yyyy @ hh:mm:ss aa zzzz",
    CONDENSED_24 = "dd/MM/yyyy @ HH:mm:ss zzzz",
    CONDENSED_12 = "dd/MM/yyyy @ hh:mm:ss aa zzzz",
    MINIMAL_24 = "dd/MM/yyyy @ HH:mm:ss",
    MINIMAL_12 = "dd/MM/yyyy @ hh:mm:ss aa",
    TIME_24 = "HH:mm:ss",
    TIME_12 = "hh:mm:ss aa"

}
