const defaultTemplate = await Deno.readTextFile(
  "./contents/default_template.html"
);
const defaultContent = await Deno.readTextFile("./contents/default_content.md");

const assets = {
  defaultTemplate,
  defaultContent,
};

await Deno.writeTextFile("./src/assets.json", JSON.stringify(assets));
