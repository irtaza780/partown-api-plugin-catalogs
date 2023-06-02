import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";
import xformCatalogBooleanFilters from "../../utils/catalogBooleanFilters.js";

export default async function citiesForFilter(_, args, context, info) {
  const { Catalog } = context.collections;

  return await Catalog.distinct("product.location.state");
}
