const defaultTemplate = await Deno.readTextFile(
  "./contents/default_template.html",
);
const defaultContent = await Deno.readTextFile("./contents/default_content.md");
const helpText = await Deno.readTextFile("./contents/help.txt");

const assets = {
  defaultTemplate,
  defaultContent,
  helpText,
};

await Deno.writeTextFile("./src/assets.json", JSON.stringify(assets));
