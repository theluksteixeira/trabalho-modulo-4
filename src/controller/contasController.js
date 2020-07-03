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

    async transferAccount(req, res) {
        const { contaOrigem, contaDestino, valor } = req.body;
        try {
            const account = await contasModel.find({ $or: [{ conta: contaOrigem }, { conta: contaDestino }] });
            console.log("###");
            console.log(account);

            const idOrigem = account[0]._id;
            let balanceOrigem = account[0].balance;

            const idDestino = account[1]._id;
            let balanceDestino = account[1].balance;

            if (account[0].agencia === account[1].agencia) {
                balanceDestino += valor;
                balanceOrigem -= valor;
            } else {
                balanceDestino += valor;
                balanceOrigem -= valor + 8;
            }

            const accountOrigem = await contasModel.findOneAndUpdate(
                {
                    _id: idOrigem,
                },
                {
                    balance: balanceOrigem,
                },
                { new: true, upsert: true }
            );

            const accountDestino = await contasModel.findOneAndUpdate(
                {
                    _id: idDestino,
                },
                {
                    balance: balanceDestino,
                },
                { new: true, upsert: true }
            );

            if (!accountOrigem || !accountDestino) {
                return res.status(404).json({ msg: "Alguma conta está inválida." });
            } else {
                return res.json({ balanceOrigem: accountOrigem.balance });
            }
        } catch (error) {
            return res.status(404).json({ msg: error });
        }
    }

    async mediaBalanceAgency(req, res) {
        const { agencia } = req.body;
        try {
            const media = await contasModel.aggregate([
                {
                    $match: {
                        agencia: agencia,
                    },
                },
                {
                    $group: {
                        _id: null,
                        average: {
                            $avg: "$balance",
                        },
                    },
                },
            ]);

            if (!media) {
                return res.status(404).json({ msg: "Não localizou a conta." });
            } else {
                return res.json({ balance: media[0].average.toFixed(2) });
            }
        } catch (error) {
            return res.status(404).json({ msg: error });
        }
    }

    async clientsMorePoors(req, res) {
        const { qtde } = req.body;
        try {
            const accounts = await contasModel.aggregate([
                {
                    $sort: { balance: 1 },
                },
                {
                    $limit: qtde,
                },
            ]);

            if (!accounts) {
                return res.status(404).json({ msg: "Não localizou a conta." });
            } else {
                return res.json(accounts);
            }
        } catch (error) {
            return res.status(404).json({ msg: error });
        }
    }

    async clientsMoreRich(req, res) {
        const { qtde } = req.body;
        try {
            const accounts = await contasModel.aggregate([
                {
                    $sort: { balance: -1 },
                },
                {
                    $limit: qtde,
                },
            ]);

            if (!accounts) {
                return res.status(404).json({ msg: "Não localizou a conta." });
            } else {
                return res.json(accounts);
            }
        } catch (error) {
            return res.status(404).json({ msg: error });
        }
    }

    async clientsPrime(req, res) {
        try {
            const accounts = await contasModel.aggregate([
                {
                    $sort: { balance: -1 },
                },
                {
                    $group: {
                        _id: "$agencia",
                        id: {
                            $first: "$_id",
                        },
                    },
                },
            ]);

            accounts.forEach(async account => {
               await contasModel.findOneAndUpdate(
                    {
                        _id: account.id,
                    },
                    {
                        agencia: 99,
                    },
                    { new: true, upsert: true }
                );
            });

            const accountPrivate = await contasModel.find({
                agencia: 99,
            });

            if (!accountPrivate) {
                return res.status(404).json({ msg: "Não localizou a conta." });
            } else {
                return res.json(accountPrivate);
            }
        } catch (error) {
            return res.status(404).json({ msg: error });
        }
    }
}

export default ContasController;
