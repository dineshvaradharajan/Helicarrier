import { parse as parseYaml } from "yaml";
import { recipeDefinitionSchema, type RecipeDefinition } from "@helicarrier/shared";

export function parseRecipeYaml(yamlContent: string): RecipeDefinition {
  const raw = parseYaml(yamlContent);
  return recipeDefinitionSchema.parse(raw);
}
