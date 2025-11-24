import { model, Schema } from "mongoose";

const DaySchema = new Schema({
    day: { type: Number, required: true },
    text: { type: String, required: true },
    imgUrl: { type: String, required: false },
    attachments: { type: [String], required: false, default: [] },
    hasSentAuto: { type: Boolean, required: true, default: false },
});

export const DayModel = model("Day", DaySchema);

export const getDay = async (dayNumber: number) => {
    return await DayModel.findOne({ day: dayNumber });
}

export const createDay = async (dayNumber: number, text: string, imgUrl?: string) => {
    const day = new DayModel({ day: dayNumber, text, imgUrl });
    return await day.save();
}