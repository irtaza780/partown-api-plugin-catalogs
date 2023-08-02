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
export default async function catalogItems(
  context,
  {
    searchQuery,
    shopIds,
    tagIds,
    catalogBooleanFilters,
    propertyFilters,
    sortByAvailableQuantity,
  } = {}
) {
  const { collections } = context;
  const { Catalog } = collections;

  if ((!shopIds || shopIds.length === 0) && (!tagIds || tagIds.length === 0)) {
    throw new ReactionError(
      "invalid-param",
      "You must provide tagIds or shopIds or both"
    );
  }

  const query = {
    "product.isDeleted": { $ne: true },
    ...catalogBooleanFilters,
    "product.isVisible": true,
  };
  if (propertyFilters) {
    const { state, propertyType, propertySaleType } = propertyFilters;
    if (state?.length) query["location.state"] = { $in: state };
    if (propertyType) query["propertyType"] = propertyType;
    if (propertySaleType) query["propertySaleType.type"] = propertySaleType;
    else query["propertySaleType.type"] = { $ne: "sold" };
  } else if (!propertyFilters?.propertySaleType) {
    query["propertySaleType.type"] = { $ne: "sold" };
  }

  if (sortByAvailableQuantity) {
  }

  if (shopIds) query.shopId = { $in: shopIds };
  if (tagIds) query["product.tagIds"] = { $in: tagIds };

  // if (searchQuery) {
  //   // query.$text = {
  //   //   $search: searchQuery
  //   // };
  //   // query["product.title"] = {
  //   //   $regex: searchQuery,
  //   //   $options: "i",
  //   // };

  //   // query.$text = {$regex: "^" + searchQuery + ".*$"}
  // }
  // console.log("here are property filters", propertyFilters, query);
  // console.log(await Catalog.find({$text: {$regex: "^" + searchQuery + ".*$"}}).toArray()
  // )

  if (searchQuery) {
    query.$or = [
      {
        "product.title": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "product.slug": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "product.location.country": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "product.location.state": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "product.location.location": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "product.propertyType": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "product.location.state": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "product.location.location": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "product.location.country": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
    ];
  }
  return Catalog.find(query);
}
