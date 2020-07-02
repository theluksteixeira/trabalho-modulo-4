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
}

export default ContasController;
