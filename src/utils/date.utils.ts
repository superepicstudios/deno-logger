import { format as formatDate } from "date-fns"

export class DateUtils {

    static format(date: Date, format: string): string {

        return formatDate(
            date,
            format
        )
        .replace(
            "GMT",
            "UTC"
        )

    }

}
