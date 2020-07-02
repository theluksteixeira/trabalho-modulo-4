import mongoose from "mongoose";

const conta = mongoose.Schema({
    agencia: {
        type: String,
        required: true,
    },
    conta: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        min: [0, "after operations should not be negative"],
    },
});

const contasModel = mongoose.model('contas', conta);

export default contasModel;
