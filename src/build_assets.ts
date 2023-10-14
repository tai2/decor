const defaultHtml = await Deno.readTextFile("./content/default_template.html");
const defaultContent = await Deno.readTextFile("./content/default_content.md");

const assets = {
  defaultHtml,
  defaultContent,
};

await Deno.writeTextFile("./src/assets.json", JSON.stringify(assets));
