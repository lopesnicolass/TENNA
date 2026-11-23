const express =
    require("express");

const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const router =
    express.Router();

const autenticarToken =
    require("../middleware/authMiddleware");

const verificarAdmin =
    require("../middleware/adminMiddleware");

const controller =
    require("../controllers/conteudoPaginaController");

router.use(
    autenticarToken
);


// =====================================================
// ADMIN — UPLOAD DE IMAGENS DOS BLOCOS
// Somente arquivos de imagem (PNG, JPG, WEBP, GIF), até 5 MB.
// =====================================================

const pastaImagensConteudo = path.join(__dirname, "..", "uploads", "conteudos");
fs.mkdirSync(pastaImagensConteudo, { recursive: true });

const formatosImagemConteudo = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif"
};

const enviarImagemConteudo = multer({
    storage: multer.diskStorage({
        destination: (_, __, cb) => cb(null, pastaImagensConteudo),
        filename: (_, arquivo, cb) =>
            cb(null, `${crypto.randomUUID()}.${formatosImagemConteudo[arquivo.mimetype]}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_, arquivo, cb) => cb(null, Boolean(formatosImagemConteudo[arquivo.mimetype]))
}).single("imagem");

router.post(
    "/imagem",
    verificarAdmin,
    (req, res) => {
        enviarImagemConteudo(req, res, (erro) => {
            if (erro) {
                return res.status(400).json({
                    mensagem: erro.code === "LIMIT_FILE_SIZE"
                        ? "A imagem deve ter no máximo 5 MB."
                        : "Não foi possível enviar a imagem."
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    mensagem: "Selecione uma imagem PNG, JPG, WEBP ou GIF."
                });
            }

            const remover = () => fs.unlink(req.file.path, () => {});

            try {
                // Confere a assinatura real do arquivo, não só o tipo informado.
                const buffer = fs.readFileSync(req.file.path);
                const tipo = req.file.mimetype;
                const valida =
                    (tipo === "image/png" && buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) ||
                    (tipo === "image/jpeg" && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
                    (tipo === "image/gif" && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString())) ||
                    (tipo === "image/webp" && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP");

                if (!valida) {
                    remover();
                    return res.status(400).json({ mensagem: "O arquivo não é uma imagem válida." });
                }

                return res.status(201).json({
                    imagem: `/uploads/conteudos/${req.file.filename}`
                });
            } catch (falha) {
                remover();
                return res.status(500).json({ mensagem: "Erro ao processar a imagem." });
            }
        });
    }
);


// =====================================================
// ALUNO
// =====================================================

router.get(
    "/topico/:topicoId",
    controller.buscarPaginaPorTopico
);


// =====================================================
// ADMIN — PÁGINAS
// =====================================================

router.get(
    "/",
    verificarAdmin,
    controller.listarPaginas
);

router.post(
    "/",
    verificarAdmin,
    controller.criarPagina
);

router.put(
    "/:id",
    verificarAdmin,
    controller.atualizarPagina
);

router.delete(
    "/:id",
    verificarAdmin,
    controller.excluirPagina
);


// =====================================================
// ADMIN — BLOCOS
// =====================================================

router.get(
    "/:paginaId/blocos",
    verificarAdmin,
    controller.listarBlocos
);

router.post(
    "/:paginaId/blocos",
    verificarAdmin,
    controller.criarBloco
);

router.put(
    "/blocos/:id",
    verificarAdmin,
    controller.atualizarBloco
);

router.delete(
    "/blocos/:id",
    verificarAdmin,
    controller.excluirBloco
);


// =====================================================
// ADMIN — BUSCAR UMA PÁGINA
//
// Fica por último para não interceptar
// /topico/:topicoId
// =====================================================

router.get(
    "/:id",
    verificarAdmin,
    controller.buscarPaginaPorId
);


module.exports =
    router;