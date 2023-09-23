const defaultHtml = await Deno.readTextFile("./content/default_template.html");

const assets = {
  defaultHtml,
};

await Deno.writeTextFile("./src/assets.json", JSON.stringify(assets));
