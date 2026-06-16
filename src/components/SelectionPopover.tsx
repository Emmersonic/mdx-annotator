interface SelectionPopoverProps {
  rect: DOMRect;
  onAddComment: () => void;
}

export function SelectionPopover({ rect, onAddComment }: SelectionPopoverProps) {
  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.top - 44,
    left: rect.left + rect.width / 2,
    transform: 'translateX(-50%)',
  };

  return (
    <div
      style={style}
      className="z-50 rounded-full bg-neutral-900 text-white text-xs px-3 py-1.5 shadow-md"
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onAddComment();
        }}
        className="flex items-center gap-1"
      >
        + comment
      </button>
    </div>
  );
}
