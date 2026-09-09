export default function Loading() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
