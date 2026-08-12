import FormWizard from "@/components/FormWizard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; r?: string }>;
}) {
  const sp = await searchParams;
  const inviteToken =
    typeof sp.t === "string" && sp.t.trim() !== "" ? sp.t.trim() : null;
  const referralToken =
    typeof sp.r === "string" && sp.r.trim() !== "" ? sp.r.trim() : null;
  const token = referralToken || inviteToken;

  return <FormWizard token={token} />;
}
