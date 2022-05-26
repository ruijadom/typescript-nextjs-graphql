import { booleanArg, extendType, nonNull } from "nexus";

export const testQuery = extendType({
  type: "Query",
  definition: t => {
    t.boolean("test", {
      args: { bool: nonNull(booleanArg()) },
      resolve: (_, { bool }) => bool,
    });
  },
});