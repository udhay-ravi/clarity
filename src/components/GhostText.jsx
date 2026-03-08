export default function GhostText({ text }) {
  if (!text) return null;

  return (
    <span className="text-ghost pointer-events-none select-none">{text}</span>
  );
}
