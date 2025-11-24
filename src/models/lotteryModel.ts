import { model, Schema } from "mongoose";

const BetSumSchecma = new Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true }
}, {_id: false});


const LotterySchema = new Schema({
    amountBetted: {
        type: [BetSumSchecma], default: []
    },
    messageId: { type: String, required: false },
    channelId: { type: String, required: false }
});

export const LotteryModel = model("Lottery", LotterySchema);

export const createLottery = async () => {
    const lottery = new LotteryModel();
    return await lottery.save();
}

export const getLotteryById = async (id: string) => {
    return await LotteryModel.findOne({ _id: id });
}

export const getAllLotteries = async () => {
    return await LotteryModel.find();
}