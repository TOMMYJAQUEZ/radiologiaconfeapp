export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col selection:bg-brand-accent selection:text-brand-dark text-white">
      {children}
    </div>
  );
}
