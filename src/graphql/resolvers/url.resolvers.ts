import URL from "../../models/url.model.js";
import { shortenURL } from "../../services/url.services.js";

const URLResolvers = {
  Query: {
    getUrl: async (parent, args, context, info) => {
      try {
        const id = args.id;
        return await URL.findById(id);
      } catch (error) {
        console.log("Query.getUrl error", error);
        throw new Error(error);
      }
    },
    getUrls: async (parent, args, context, info) => {
      try {
        const pagination = args.pagination || {};
        const filters = args.filters || {};

        let { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const constructedFilters: any = {};

        filters.url &&
          (constructedFilters.url = { $regex: filters.url, $options: "i" });
        filters.shortUrl &&
          (constructedFilters.shortUrl = {
            $regex: filters.shortUrl,
            $options: "i",
          });
        // match code exactly
        filters.code && (constructedFilters.code = filters.code);
        filters.user && (constructedFilters.user = filters.user);

        const urls = await URL.find(constructedFilters)
          .limit(limit)
          .skip(skip)
          .populate("user");
        const totalCount = await URL.countDocuments(constructedFilters);
        const pages = Math.ceil(totalCount / limit);

        const meta = {
          page,
          limit,
          total: totalCount,
          pages: pages,
        };

        return {
          data: urls,
          meta,
        };
      } catch (error) {
        console.log("Query.getUrls error", error);
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createUrl: async (parent, args, context, info) => {
      try {
        const url = args.url;
        const userId = context.user.data.id;

        return shortenURL(url, userId);
      } catch (error) {
        console.log("Mutation.createUrl error", error);
        throw new Error(error);
      }
    },
    updateUrl: async (parent, args, context, info) => {
      try {
        const { id, url } = args;
        return await URL.findByIdAndUpdate(id, { url }, { new: true }).populate(
          "user"
        );
      } catch (error) {
        console.log("Mutation.updateUrl error", error);
        throw new Error(error);
      }
    },
    deleteUrl: async (parent, args, context, info) => {
      try {
        const { id } = args;
        await URL.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.log("Mutation.deleteUrl error", error);
        throw new Error(error);
      }
    },
  },
};

export default URLResolvers;
