import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name catalogItems
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Catalog by shop ID and/or tag ID
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.searchQuery] - Optional text search query
 * @param {String[]} [params.shopIds] - Shop IDs to include (OR)
 * @param {String[]} [params.tags] - Tag IDs to include (OR)
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItems(context, { searchQuery, shopIds, tagIds, catalogBooleanFilters, propertyFilters } = {}) {
  const { collections } = context;
  const { Catalog } = collections;
  
  if ((!shopIds || shopIds.length === 0) && (!tagIds || tagIds.length === 0)) {
    throw new ReactionError("invalid-param", "You must provide tagIds or shopIds or both");
  }
  
  const query = {
    "product.isDeleted": { $ne: true },
    ...catalogBooleanFilters,
    "product.isVisible": true
  };
  if(propertyFilters){
    const { state, propertyType, propertySaleType } = propertyFilters;
    if(state?.length) query['location.state'] = { $in: state };
    if(propertySaleType) query['propertySaleType.type']=propertySaleType;
    if(propertyType) query['propertyType'] = propertyType
  }
  if (shopIds) query.shopId = { $in: shopIds };
  if (tagIds) query["product.tagIds"] = { $in: tagIds };

  
  if (searchQuery) {
    query.$text = {
      $search: _.escapeRegExp(searchQuery)
    };
  }
  console.log("here are property filters", propertyFilters, query)
  return Catalog.find(query);
}
