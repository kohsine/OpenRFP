export async function uploadJson(json: any): Promise<string> {
  if (!process.env.NEXT_PUBLIC_JWT) throw new Error("IPFS authorization undefined");
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: process.env.NEXT_PUBLIC_JWT,
    },
    body: JSON.stringify({ pinataContent: json }),
  };

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", options);
  const { IpfsHash } = await res.json();
  return IpfsHash;
}

export async function fetchJson(hash: string): Promise<any> {
  const res = await fetch(process.env.NEXT_PUBLIC_IPFS_GATEWAY + hash);
  return await res.json();
}
