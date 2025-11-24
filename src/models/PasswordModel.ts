import { model, Schema } from "mongoose";

const PasswordSchema = new Schema({
    password: { type: String, required: true },
    points: { type: Number, required: true },
})

export const PasswordModel = model("PasswordModel", PasswordSchema);

export const getPassword = async (password: string) => {
    return await PasswordModel.findOne({ password });
}

export const createPassword = async (password: string, points: number) => {
    const passwordEntry = new PasswordModel({ password, points });
    return await passwordEntry.save();
}