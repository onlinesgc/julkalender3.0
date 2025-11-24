import { model, Schema } from "mongoose";
const UserSchema = new Schema({
    discordId: { type: String, required: true, unique: true },
    days: { type: [Number], required: true, default: [] },
    points: { type: Number, required: true, default: 0 },
    passwordesRedeemed: { type: [String], required: true, default: [] },
});

export const UserModel = model("User", UserSchema);

export const getUserByDiscordId = async (discordId: string) => {
    return await UserModel.findOne({ discordId });
}

export const createUser = async (discordId: string) => {
    const user = new UserModel({ discordId });
    return await user.save();
}

export const getAllUsers = async () => {
    return await UserModel.find();
}