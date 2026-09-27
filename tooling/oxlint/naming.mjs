// A local Oxlint plugin. Oxlint's `id-match` has no look-ahead, so it cannot
// hold a denylist; the naming rule lives in AGENTS.md ("Naming").

// Words that are vague even alone.
const vagueAlone = new Set([
  "data",
  "item",
  "items",
  "info",
  "obj",
  "tmp",
  "temp",
  "raw",
  "entry",
  "entries",
  "payload",
  "thing",
  "things",
]);

// Words that say only a value's shape or position — clear as a qualifier on a
// concept (`verseList`), vague when every word of a name is one of them.
const shapeWords = new Set([
  ...vagueAlone,
  "value",
  "values",
  "val",
  "result",
  "results",
  "res",
  "list",
  "map",
  "set",
  "next",
  "prev",
  "base",
  "current",
  "new",
  "old",
  "out",
]);

function splitWords(identifierName) {
  return identifierName
    .replace(/^_+/, "")
    .split(/(?<=[a-z0-9])(?=[A-Z])|_/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function isShapeOnly(identifierName) {
  const words = splitWords(identifierName);
  if (words.length === 0) return false;
  if (words.length === 1) return vagueAlone.has(words[0]);
  return words.every((word) => shapeWords.has(word));
}

// The identifiers a binding pattern introduces, less shorthand destructuring:
// `const { data } = …` takes its name from the API it reads.
function boundIdentifiers(pattern) {
  if (!pattern) return [];
  switch (pattern.type) {
    case "Identifier":
      return [pattern];
    case "AssignmentPattern":
      return boundIdentifiers(pattern.left);
    case "RestElement":
      return boundIdentifiers(pattern.argument);
    case "ArrayPattern":
      return pattern.elements.flatMap(boundIdentifiers);
    case "ObjectPattern":
      return pattern.properties.flatMap((property) =>
        property.type === "RestElement"
          ? boundIdentifiers(property)
          : property.shorthand
            ? []
            : boundIdentifiers(property.value),
      );
    default:
      return [];
  }
}

const noShapeOnlyNames = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow a binding named only by shape words, such as `data` or `rawData`.",
    },
    messages: {
      shapeOnly:
        "`{{name}}` names only a shape. Name the thing it holds — a CONTEXT.md term or its role (AGENTS.md, Naming).",
    },
  },
  create(context) {
    function check(identifiers) {
      for (const identifier of identifiers) {
        if (isShapeOnly(identifier.name)) {
          context.report({
            node: identifier,
            messageId: "shapeOnly",
            data: { name: identifier.name },
          });
        }
      }
    }
    function checkFunction(node) {
      if (node.id) check([node.id]);
      check(node.params.flatMap(boundIdentifiers));
    }
    return {
      VariableDeclarator(node) {
        check(boundIdentifiers(node.id));
      },
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
      CatchClause(node) {
        check(boundIdentifiers(node.param));
      },
    };
  },
};

function keyName(key) {
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal" && typeof key.value === "string") return key.value;
  return undefined;
}

// Every name a declaration introduces, including shorthand destructuring and
// property keys, since a stored `kind` field is as vague as a `kind` local.
const noKind = {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow `kind` in any declared name." },
    messages: {
      kind: "`{{name}}` uses `kind`. Say what distinguishes the values, such as `medicationType` or `fileFormat` (AGENTS.md, Naming).",
    },
  },
  create(context) {
    function checkName(node, name) {
      if (name && splitWords(name).includes("kind")) {
        context.report({ node, messageId: "kind", data: { name } });
      }
    }
    function checkPattern(pattern) {
      if (!pattern) return;
      if (pattern.type === "ObjectPattern") {
        for (const property of pattern.properties) {
          if (property.type === "RestElement") checkPattern(property.argument);
          else checkPattern(property.value);
        }
        return;
      }
      for (const identifier of boundIdentifiers(pattern)) {
        checkName(identifier, identifier.name);
      }
    }
    function checkFunction(node) {
      if (node.id) checkName(node.id, node.id.name);
      node.params.forEach(checkPattern);
    }
    function checkKey(node) {
      if (!node.computed) checkName(node.key, keyName(node.key));
    }
    function checkId(node) {
      checkName(node.id, keyName(node.id));
    }
    return {
      VariableDeclarator(node) {
        checkPattern(node.id);
      },
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
      CatchClause(node) {
        checkPattern(node.param);
      },
      Property(node) {
        if (node.parent.type === "ObjectExpression") checkKey(node);
      },
      PropertyDefinition: checkKey,
      MethodDefinition: checkKey,
      TSPropertySignature: checkKey,
      TSMethodSignature: checkKey,
      TSTypeAliasDeclaration: checkId,
      TSInterfaceDeclaration: checkId,
      TSEnumDeclaration: checkId,
      TSEnumMember: checkId,
      ClassDeclaration(node) {
        if (node.id) checkId(node);
      },
    };
  },
};

export default {
  meta: { name: "naming" },
  rules: {
    "no-shape-only-names": noShapeOnlyNames,
    "no-kind": noKind,
  },
};
