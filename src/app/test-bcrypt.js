import bcrypt from "bcryptjs";

const runTest = async () => {
  const password = "dkikisecret123";
  const hash = "$2b$10$tw4HdgQAN5IWWGqTIGLr7.ocafKwZSmBYNmHxeeVpeabc7u/RJ0qi";

  const result = await bcrypt.compare(password, hash);
  console.log("Does the password match the hash?", result);
};

runTest();
