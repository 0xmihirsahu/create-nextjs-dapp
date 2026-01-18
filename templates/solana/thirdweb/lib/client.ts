import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";

if (!clientId) {
  console.warn(
    "Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID. Get one at https://thirdweb.com/dashboard"
  );
}

export const client = createThirdwebClient({
  clientId,
});
