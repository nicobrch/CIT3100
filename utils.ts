export const hashPassword = async (password: string) => {
  const hash = await Bun.password.hash(password)
  return hash
}

export const comparePassword = async (password: string, hash: string) => {
  const result = await Bun.password.verify(password, hash)
  return result
}

export const generateApiKey = () : string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let apiKey = "";
  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    apiKey += characters[randomIndex];
  }
  return apiKey;
}