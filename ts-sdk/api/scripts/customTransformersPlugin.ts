// Delete this file when https://github.com/hey-api/openapi-ts/pull/3409 would be merged and released
// will be merged and released

import { $, type IR } from "@hey-api/openapi-ts";

const refToName = (ref: string) => ref.split("/").filter(Boolean).pop() ?? ref;

const toCamelCase = (value: string) =>
  value
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/[-_\s./]+([A-Za-z0-9])/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, c => c.toLowerCase());

const applyNaming = (value: string, options: { case: "camelCase"; name: string }) =>
  options.name.replace("{{name}}", options.case === "camelCase" ? toCamelCase(value) : value);

const createOperationKey = ({ method, path }: { method: string; path: string }) =>
  `${method.toUpperCase()} ${path}`;

const operationResponsesMap = (operation: any) => {
  const responses = operation.responses ?? {};
  const successSchemas: Array<IR.SchemaObject> = [];
  for (const [statusCode, response] of Object.entries(responses)) {
    if (!response || typeof response !== "object") continue;
    if (statusCode === "default" || /^2\d\d$/.test(statusCode) || statusCode === "2XX") {
      const schema = (response as { schema?: IR.SchemaObject }).schema;
      if (schema) successSchemas.push(schema);
    }
  }

  if (!successSchemas.length) {
    return { response: undefined };
  }

  if (successSchemas.length === 1) {
    return { response: successSchemas[0] };
  }

  return {
    response: {
      items: successSchemas,
      logicalOperator: "or",
    } as IR.SchemaObject,
  };
};

const dataVariableName = "data";
const buildingSymbols = new Set<number>();
let additionalPropertiesTargetCounter = 0;

const isNodeReturnStatement = (node: unknown) =>
  !!node && typeof node === "object" && "~dsl" in node && (node as { "~dsl": string })["~dsl"] === "ReturnTsDsl";

type ExpressionTransformer = ({
  schema,
  dataExpression,
}: {
  schema: IR.SchemaObject;
  dataExpression?: ReturnType<typeof $.expr | typeof $.attr> | string;
}) => Array<ReturnType<typeof $.fromValue>> | undefined;

const bigIntExpressions: ExpressionTransformer = ({ dataExpression, schema }) => {
  if (schema.type !== "integer" || schema.format !== "int64" || dataExpression === undefined) return;
  const callExpression = $("BigInt").call($.expr(dataExpression).attr("toString").call());
  if (typeof dataExpression === "string") return [callExpression];
  return [$.expr(dataExpression).assign(callExpression)];
};

const dateExpressions: ExpressionTransformer = ({ dataExpression, schema }) => {
  if (schema.type !== "string" || (schema.format !== "date" && schema.format !== "date-time")) return;
  if (typeof dataExpression === "string") return [$.new("Date").arg(dataExpression)];
  if (dataExpression) return [$.expr(dataExpression).assign($.new("Date").arg(dataExpression))];
};

const processSchemaType = ({
  dataExpression,
  plugin,
  schema,
}: {
  dataExpression?: ReturnType<typeof $.expr | typeof $.attr> | string;
  plugin: any;
  schema: IR.SchemaObject;
}): Array<any> => {
  if (schema.$ref) {
    const query = {
      category: "transform",
      resource: "definition",
      resourceId: schema.$ref,
    } as const;
    const symbol =
      plugin.getSymbol(query) ??
      plugin.symbol(
        applyNaming(refToName(schema.$ref), {
          case: "camelCase",
          name: "{{name}}SchemaResponseTransformer",
        }),
        { meta: query },
      );

    if (!symbol.node && !buildingSymbols.has(symbol.id)) {
      buildingSymbols.add(symbol.id);
      try {
        const refSchema = plugin.context.resolveIrRef<IR.SchemaObject>(schema.$ref);
        const nested = processSchemaType({
          dataExpression: $(dataVariableName),
          plugin,
          schema: refSchema,
        });
        if (nested.length) {
          const last = nested[nested.length - 1];
          if (!isNodeReturnStatement(last)) nested.push($.return(dataVariableName));
          plugin.node(
            $.const(symbol).assign(
              $.func()
                .param(dataVariableName, p => p.type("any"))
                .do(...nested),
            ),
          );
        }
      } finally {
        buildingSymbols.delete(symbol.id);
      }
    }

    if (symbol.node || buildingSymbols.has(symbol.id)) {
      const ref = plugin.referenceSymbol(query);
      const callExpression = $(ref).call(dataExpression);
      if (dataExpression) {
        if (typeof dataExpression === "string" && dataExpression === "item") {
          return [$.return(callExpression)];
        }
        return [typeof dataExpression === "string" ? callExpression : $(dataExpression).assign(callExpression)];
      }
    }

    return [];
  }

  if (schema.type === "array") {
    if (!dataExpression || typeof dataExpression === "string") return [];
    const itemSchema = schema.items?.[0] ? schema.items[0] : { ...schema, type: undefined };
    const nodes = !schema.items ? [] : processSchemaType({ dataExpression: "item", plugin, schema: itemSchema });
    if (!nodes.length) return [];

    const mapCallbackStatements = [...nodes];
    if (!mapCallbackStatements.some(stmt => isNodeReturnStatement(stmt))) {
      mapCallbackStatements.push($.return("item"));
    }

    return [
      $(dataExpression).assign(
        $(dataExpression)
          .attr("map")
          .call(
            $.func()
              .param("item", p => p.type("any"))
              .do(...mapCallbackStatements),
          ),
      ),
    ];
  }

  if (schema.type === "object") {
    const nodes: Array<any> = [];
    const required = schema.required ?? [];

    for (const name in schema.properties) {
      const property = schema.properties[name]!;
      const propertyAccessExpression = $(dataExpression || dataVariableName).attr(name);
      const propertyNodes = processSchemaType({
        dataExpression: propertyAccessExpression,
        plugin,
        schema: property,
      });
      if (!propertyNodes.length) continue;

      const noNullableTypesInSchema = !property.items?.find(x => x.type === "null");
      const requiredField = required.includes(name);
      if (requiredField && noNullableTypesInSchema) {
        nodes.push(...propertyNodes);
      } else {
        nodes.push($.if(propertyAccessExpression).do(...propertyNodes));
      }
    }

    if (schema.additionalProperties !== undefined && schema.additionalProperties !== false && dataExpression) {
      const declaredProperties = Object.keys(schema.properties ?? {});
      const targetVar = `_additionalPropertiesTarget${++additionalPropertiesTargetCounter}`;
      const valueNodes = processSchemaType({
        dataExpression: $.expr(`${targetVar}[key]`),
        plugin,
        schema: schema.additionalProperties,
      });

      if (valueNodes.length) {
        const callbackNodes: Array<any> = [];

        if (declaredProperties.length) {
          callbackNodes.push(
            $.if(
              $.expr($.array(...declaredProperties.map(name => $.literal(name))))
                .attr("includes")
                .call($.expr("key")),
            ).do($.return()),
          );
        }

        callbackNodes.push(...valueNodes);

        nodes.push($.const(targetVar).assign(dataExpression));
        nodes.push(
          $("Object")
            .attr("keys")
            .call($.expr(targetVar))
            .attr("forEach")
            .call(
              $.func()
                .param("key", p => p.type("any"))
                .do(...callbackNodes),
            ),
        );
      }
    }

    return nodes;
  }

  if (schema.items) {
    if (schema.items.length === 1) {
      return processSchemaType({
        dataExpression: "item",
        plugin,
        schema: schema.items[0]!,
      });
    }

    let arrayNodes: Array<any> = [];
    if (
      schema.logicalOperator === "and" ||
      (schema.items.length === 2 && schema.items.find(item => item.type === "null" || item.type === "void"))
    ) {
      for (const item of schema.items) {
        const nodes = processSchemaType({
          dataExpression: dataExpression || "item",
          plugin,
          schema: item,
        });
        if (nodes.length) {
          if (dataExpression) {
            arrayNodes = arrayNodes.concat(nodes);
          } else {
            arrayNodes.push($.if("item").do(...nodes), $.return("item"));
          }
        }
      }
      return arrayNodes;
    }
  }

  for (const transformer of plugin.config.transformers) {
    const transformed = transformer({
      config: plugin.config,
      dataExpression,
      schema,
    });
    if (transformed) return transformed;
  }

  return [];
};

const handler = ({ plugin }: { plugin: any }) => {
  plugin.forEach(
    "operation",
    ({ operation }: { operation: any }) => {
      const { response } = operationResponsesMap(operation);
      if (!response) return;

      if (response.items && response.items.length > 1 && response.logicalOperator !== "and") {
        if (plugin.context.config.logs.level === "debug") {
          console.warn(
            `❗️ Transformers warning: route ${createOperationKey(operation)} has ${response.items.length} non-void success responses. This is currently not handled and we will not generate a response transformer. Please open an issue if you'd like this feature https://github.com/hey-api/openapi-ts/issues`,
          );
        }
        return;
      }

      const symbolResponse = plugin.querySymbol({
        category: "type",
        resource: "operation",
        resourceId: operation.id,
        role: "response",
      });
      if (!symbolResponse) return;

      const nodes = processSchemaType({
        dataExpression: $(dataVariableName),
        plugin,
        schema: response,
      });
      if (!nodes.length) return;
      if (!isNodeReturnStatement(nodes[nodes.length - 1])) {
        nodes.push($.return(dataVariableName));
      }

      const symbol = plugin.symbol(
        applyNaming(operation.id, {
          case: "camelCase",
          name: "{{name}}ResponseTransformer",
        }),
        {
          meta: {
            category: "transform",
            resource: "operation",
            resourceId: operation.id,
            role: "response",
          },
        },
      );
      plugin.node(
        $.const(symbol)
          .export()
          .assign(
            $.func()
              .async()
              .param(dataVariableName, p => p.type("any"))
              .returns($.type("Promise").generic(symbolResponse))
              .do(...nodes),
          ),
      );
    },
    { order: "declarations" },
  );
};

export const customTransformersPlugin = ({
  bigInt = true,
  dates = true,
  transformers = [],
  typeTransformers = [],
}: {
  bigInt?: boolean;
  dates?: boolean;
  transformers?: ReadonlyArray<ExpressionTransformer>;
  typeTransformers?: ReadonlyArray<({ schema }: { schema: IR.SchemaObject }) => unknown>;
}) => ({
  name: "@hey-api/transformers",
  dependencies: ["@hey-api/typescript"],
  tags: ["transformer"],
  handler,
  config: {
    bigInt,
    dates,
    includeInEntry: false,
    transformers,
    typeTransformers,
  },
  resolveConfig: (plugin: any) => {
    if (!plugin.config.transformers) {
      plugin.config.transformers = [];
    }
    if (plugin.config.dates) {
      plugin.config.transformers = [...plugin.config.transformers, dateExpressions];
    }
    if (plugin.config.bigInt) {
      plugin.config.transformers = [...plugin.config.transformers, bigIntExpressions];
    }
  },
});
