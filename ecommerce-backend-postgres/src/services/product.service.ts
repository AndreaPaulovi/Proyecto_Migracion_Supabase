import { Product, ProductWithRelations } from "../schemas/products";
import { createInventory } from "../services/inventory.service";
import AppError from "../utils/AppError";
import { uploadMulterImage } from "../integrations/cloudinary/upload";
import generateChanges from "../utils/generateChanges";
import { deleteImage } from "../integrations/cloudinary/delete";
import {
  CreateProductData,
  CreateProductParams,
  DeleteProductParams,
  GetProductParams,
  GetProductsParams,
  GetProductsResult,
  UpdateProductParams,
  UpdateProductResult,
} from "../types/entities/product.types";

import * as productRepository from "../repositories/product.repository";

export const getProducts = async (
  params: GetProductsParams,
): Promise<GetProductsResult> => {
  const { filters } = params;

  const { products, total } = await productRepository.find(filters);

  const { page, limit } = filters;

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const createProduct = async (
  params: CreateProductParams,
): Promise<ProductWithRelations> => {
  const { payload, thumbnail } = params;

  const existing = await productRepository.findByName(payload.name);

  if (existing) {
    throw new AppError(400, `A product named ${payload.name} already exists`);
  }

  const {
    initialQuantity: initial_quantity,
    weight_Grams,
    ...rest
  } = payload;

  const finalPayload: CreateProductData = {
    ...rest,
    weight_grams: weight_Grams,
  };

  if (thumbnail) {
    const { url, public_id } = await uploadMulterImage(
      thumbnail,
      "products/thumbnails",
    );

    finalPayload.thumbnail_url = url;
    finalPayload.thumbnail_public_id = public_id;
  }

  const product = await productRepository.add(finalPayload);

  await createInventory(
    product.id,
    initial_quantity !== undefined ? initial_quantity : 0,
  );

  return await productRepository.findWithRelationsById(product.id);
};

export const getProductById = async (params: GetProductParams) => {
  const { productId } = params;

  const product = await productRepository.findWithRelationsById(productId);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return product;
};

export const updateProduct = async (
  params: UpdateProductParams,
): Promise<UpdateProductResult> => {
  const { productId, payload, thumbnail } = params;

  const product = await productRepository.findById(productId);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const { weight_Grams, ...rest } = payload;

  const mod: Partial<Product> = {
    ...rest,
    weight_grams: weight_Grams,
  };

  const { old_values, new_values } = generateChanges(product, mod, false);

  // Check whether the new name already belongs to another product.
  if (new_values.name) {
    const existing = await productRepository.findByName(
      new_values.name as string,
    );

    if (existing && existing.id !== productId) {
      throw new AppError(
        400,
        `A product named ${new_values.name} already exists`,
      );
    }
  }

  // Upload and register a new thumbnail when provided.
  if (thumbnail) {
    const { url, public_id } = await uploadMulterImage(
      thumbnail,
      "products/thumbnails",
    );

    new_values.thumbnail_url = url;
    new_values.thumbnail_public_id = public_id;

    old_values.thumbnail_url = product.thumbnail_url;
    old_values.thumbnail_public_id = product.thumbnail_public_id;
  }

  if (Object.keys(new_values).length === 0) {
    throw new AppError(400, "No changes have been made");
  }

  // Persist the changes and retrieve the updated product.
  const updated = await productRepository.update(productId, new_values);

  // Delete the previous image only after the database update succeeds.
  if (thumbnail && product.thumbnail_public_id) {
    await deleteImage(product.thumbnail_public_id);
  }

  return {
    product: updated,
    old_values,
    new_values,
  };
};

export const deleteProduct = async (
  params: DeleteProductParams,
): Promise<ProductWithRelations> => {
  const { productId } = params;

  const product = await productRepository.findWithRelationsById(productId);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (product.thumbnail_public_id) {
    await deleteImage(product.thumbnail_public_id);
  }

  await productRepository.remove(productId);

  return product;
};