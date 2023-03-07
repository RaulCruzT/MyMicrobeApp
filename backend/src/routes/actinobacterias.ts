import express from "express";
import * as ActinobacteriasController from "../controllers/actinobacterias";

const router = express.Router();

router.get("/", ActinobacteriasController.getActinobacterias);

router.get("/:actinobacteriaId", ActinobacteriasController.getActinobacteria);

router.post("/", ActinobacteriasController.createActinobacteria);

router.patch("/:actinobacteriaId", ActinobacteriasController.updateActinobacteria);

router.delete("/:actinobacteriaId", ActinobacteriasController.deleteActinobacteria);

export default router;