import { CodegenConfig } from "@graphql-codegen/cli";
import * as dotenv from "dotenv";

dotenv.config();

const config: CodegenConfig = {
    schema: `https://${process.env.NEXT_PUBLIC_URL}/graphql`,
    documents: ["./src/**/*.graphql"],
    generates: {
        "./schema.graphql": { plugins: ["schema-ast"] },
        "src/shared/api/graphql.ts": {
            plugins: ["typescript", "typescript-operations", "typed-document-node"],
            config: {
                skipTypename: false,
                avoidOptionals: false,
                useTypeImports: true,
            },
        },
        "./graphql.schema.json": { plugins: ["introspection"] },
    },
};

export default config;
