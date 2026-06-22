import bcrypt from "bcryptjs";

async function run() {
  const password = "maxdoraforever";
  const hash = await bcrypt.hash(password, 10);
  console.log("Your bcrypt hash is:\n", hash);
}

run();
