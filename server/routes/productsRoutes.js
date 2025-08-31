import express from "express"
import { createProducts, deleteProducts, getAllProducts, updateProducts } from "../controllers/productsController.js";

const productRouter = express.Router();

productRouter.get("/",getAllProducts);
productRouter.post("/",createProducts);
productRouter.put("/:id",updateProducts);
productRouter.delete("/:id",deleteProducts);

export default productRouter;