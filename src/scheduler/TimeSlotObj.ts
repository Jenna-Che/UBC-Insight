import {TimeSlot} from "./IScheduler";

export default class TimeSlotObj {

    public static allTimeSlots(): TimeSlot[] {
            let allTimeSlot: TimeSlot[] = ["MWF 0800-0900", "MWF 0900-1000", "MWF 1000-1100",
                "MWF 1100-1200", "MWF 1200-1300", "MWF 1300-1400",
                "MWF 1400-1500", "MWF 1500-1600", "MWF 1600-1700",
                "TR  0800-0930", "TR  0930-1100", "TR  1100-1230",
                "TR  1230-1400", "TR  1400-1530", "TR  1530-1700"];
            return allTimeSlot;
            // "MWF 0800-0900" | "MWF 0900-1000" | "MWF 1000-1100" |
            // "MWF 1100-1200" | "MWF 1200-1300" | "MWF 1300-1400" |
            // "MWF 1400-1500" | "MWF 1500-1600" | "MWF 1600-1700" |
            // "TR  0800-0930" | "TR  0930-1100" | "TR  1100-1230" |
            // "TR  1230-1400" | "TR  1400-1530" | "TR  1530-1700";
    }
}
