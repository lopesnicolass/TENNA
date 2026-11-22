const express = require("express");
const multer = require("multer");
const path = require("path");


const {
    listarTodosUsuarios,
    buscarMeuPerfil,
    editarPerfil,
    editarFoto,
    excluir
} = require("../controllers/usuarioController");

const {
    buscar: buscarPreferenciaContagem,
    atualizar: atualizarPreferenciaContagem
} = require("../controllers/preferenciaContagemController");

const autenticarToken =
    require("../middleware/authMiddleware");

const verificarAdmin =
    require("../middleware/adminMiddleware");

const router = express.Router();


// =====================================================
// CONFIGURAÇÃO DAS FOTOS DE PERFIL
// =====================================================

const storage = multer.memoryStorage();


       

   


// =====================================================
// FILTRO DE IMAGEM
// =====================================================

const fileFilter =
    function (req, file, cb) {

        const extensao =
            path.extname(
                file.originalname
            ).toLowerCase();

        const permitidas =
            [".jpg", ".jpeg", ".png", ".webp"];

        if (!permitidas.includes(extensao)) {

            return cb(
                new Error(
                    "Apenas JPG, JPEG, PNG ou WEBP são permitidos."
                )
            );

        }

        cb(null, true);

    };


// =====================================================
// MULTER
// =====================================================

const upload =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize: 5 * 1024 * 1024
        }

    });


// =====================================================
// MEU PERFIL
// =====================================================

router.get(
    "/meu-perfil",
    autenticarToken,
    buscarMeuPerfil
);


// =====================================================
// EDITAR PERFIL
// =====================================================

router.put(
    "/meu-perfil",
    autenticarToken,
    editarPerfil
);


// =====================================================
// ALTERAR FOTO
// =====================================================

router.post(
    "/meu-perfil/foto",
    autenticarToken,
    upload.single("foto"),
    editarFoto
);


// =====================================================
// PREFERÊNCIA DA CONTAGEM DO VESTIBULINHO
// =====================================================

router.get(
    "/preferencias/contagem",
    autenticarToken,
    buscarPreferenciaContagem
);

router.put(
    "/preferencias/contagem",
    autenticarToken,
    atualizarPreferenciaContagem
);


// =====================================================
// LISTAR USUÁRIOS — ADMIN
// =====================================================

router.get(
    "/",
    autenticarToken,
    verificarAdmin,
    listarTodosUsuarios
);


// =====================================================
// EXCLUIR USUÁRIO — ADMIN
// =====================================================

router.delete(
    "/:id",
    autenticarToken,
    verificarAdmin,
    excluir
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;