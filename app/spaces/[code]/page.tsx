export default async function SpaceDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return <main className="min-h-screen" style={{ backgroundColor: 'var(--color-concrete-bone)' }} data-code={code} />
}
