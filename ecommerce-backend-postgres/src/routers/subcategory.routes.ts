import express from "express";
import validate from "../middlewares/validation.middleware";
import {
  CreateSubcategoryBodySchema,
  subcategory_idParamsSchema,
  SubcategoryQuerySchema,
  SubcategorySlugParamsSchema,
  UpdateSubcategoryBodySchema,
} from "../schemas/subcategories";
import {
  CategoryIdParamsSchema,
  CategorySlugParamsSchema,
} from "../schemas/categories";
import { authorizeRoles, protectRoute } from "../middlewares/auth.middleware";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  getSubcategoryBySlug,
  updateSubcategory,
} from "../controllers/subcategory.controller";
import {
  readLimiter,
  writeLimiter,
} from "../middlewares/rate.limit.middlewares";

const router = express.Router();

router.route("/:categorySlug/subcategory").get(
  readLimiter,
  validate({
    params: CategorySlugParamsSchema,
    query: SubcategoryQuerySchema,
  }),
  getSubcategories,
);

router.post(
  "/:categoryId/subcategory",
  writeLimiter,
  protectRoute,
  authorizeRoles(["admin"]),
  validate({
    params: CategoryIdParamsSchema,
    body: CreateSubcategoryBodySchema,
  }),
  createSubcategory,
);

router.get(
  "/:categorySlug/subcategory/:subcategorySlug",
  readLimiter,
  validate({
    params: CategorySlugParamsSchema.merge(SubcategorySlugParamsSchema),
  }),
  getSubcategoryBySlug,
);

router
  .route("/:categoryId/subcategory/:subcategory_id")
  .patch(
    writeLimiter,
    protectRoute,
    authorizeRoles(["admin"]),
    validate({
      params: CategoryIdParamsSchema.merge(subcategory_idParamsSchema),
      body: UpdateSubcategoryBodySchema,
    }),
    updateSubcategory,
  )
  .delete(
    writeLimiter,
    protectRoute,
    authorizeRoles(["admin"]),
    validate({
      params: CategoryIdParamsSchema.merge(subcategory_idParamsSchema),
    }),
    deleteSubcategory,
  );

export default router;
