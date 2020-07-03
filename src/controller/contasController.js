import contasModel from "../model/contasModel.js";

class ContasController {
    //Listar todas as contas
    async index(_, res) {
        try {
            const data = await contasModel.find({});
            res.send(data);
        } catch (error) {
            res.status(500).send("Erro");
        }
    }

    async updateBalance(req, res) {
        const { agencia, conta, balance } = req.body;
        try {
            const account = await contasModel.findOne({
                agencia: agencia,
                conta: conta,
            });

            if (!account) {
                return res.status(404).json({ msg: "Não localizou a conta." });
            }

            let balanceValue = balance;

            //é cobrado uma taxa de -1 pelo saque
            if (balance < 0) {
                balanceValue = balanceValue - 1;
            }

            const newBalance = account.balance + balanceValue;

            if (newBalance < 0) {
                return res.status(404).json({ msg: "Saldo insuficiente." });
            }

            const id = account._id;
            const accountUpdate = await contasModel.findOneAndUpdate(
                {
                    _id: id,
                },
                {
                    balance: newBalance,
                },
                { new: true, upsert: true }
            );

            if (!accountUpdate) {
                return res.status(404).json({ msg: "Não localizou a conta." });
            } else {
                return res.json({ balance: accountUpdate.balance });
            }
        } catch (error) {
            return res.status(404).json({ msg: error });
        }
    }

    async findAccount(req, res) {
        const { agencia, conta } = req.body;
        try {
            const account = await contasModel.findOne({
                agencia: agencia,
                conta: conta,
            });

            if (!account) {
                return res.status(404).json({ msg: "Não localizou a conta." });
            } else {
                return res.json({ balance: account.balance });
            }
        } catch (error) {
            return res.status(404).json({ msg: error });
        }
    }

    async deleteAccount(req, res) {
        const { agencia, conta } = req.body;
        try {
            const accountUpdate = await contasModel.findOneAndDelete({
                conta: conta,
                agencia: agencia,
            });

            if (!accountUpdate) {
                return res.status(404).json({ msg: "Não localizou a conta." });
            } else {
                return res.json({ activeAccounts: await contasModel.countDocuments({ agencia: agencia }) });
            }
        } catch (error) {
            return res.status(404).json({ msg: error });
        }
    }
}

export default ContasController;
