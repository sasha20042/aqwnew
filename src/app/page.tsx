import FormWizard from "@/components/FormWizard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const sp = await searchParams;
  const token = typeof sp.t === "string" && sp.t.trim() !== "" ? sp.t.trim() : null;

  return <FormWizard token={token} />;
}
