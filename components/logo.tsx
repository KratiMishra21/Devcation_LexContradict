export function Logo() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
      <div className="font-bold text-lg tracking-tight">
        <span className="text-foreground">Lex</span>
        <span className="text-red-500" style={{ color: '#d32f2f' }}>Contradict</span>
      </div>
    </div>
  );
}
